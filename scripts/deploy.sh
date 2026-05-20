#!/usr/bin/env bash
# QuizParty — production update script
# Run on VPS: bash /var/www/quizparty/scripts/deploy.sh

set -euo pipefail

APP_DIR="/var/www/quizparty"
WEB_DIST="$APP_DIR/apps/web/dist"
WEB_PUBLIC="/var/www/quizparty-web"
BACKEND_NAME="quizparty-backend"

log() { echo -e "\n\033[1;32m>>> $*\033[0m"; }
err() { echo -e "\033[1;31m[ERROR] $*\033[0m" >&2; exit 1; }

cd "$APP_DIR" || err "Cannot cd to $APP_DIR"

# ── 1. Git pull ──────────────────────────────────────────────────────────────
log "Pulling latest changes..."
git pull origin main

# ── 2. Dependencies ──────────────────────────────────────────────────────────
log "Installing dependencies..."
pnpm install --frozen-lockfile

# ── 3. Docker (ensure infra is running) ──────────────────────────────────────
log "Ensuring Docker containers are up..."
docker compose up -d
docker compose ps

# ── 4. Build shared ──────────────────────────────────────────────────────────
log "Building @quizparty/shared..."
pnpm --filter @quizparty/shared build

# ── 5. Prisma: generate client + migrate ─────────────────────────────────────
log "Running Prisma generate..."
pnpm db:generate

log "Running DB migrations..."
pnpm db:migrate

# ── 56. Build backend ─────────────────────────────────────────────────────────
log "Building @quizparty/backend..."
pnpm --filter @quizparty/backend build

# ── 7. Restart backend via PM2 ───────────────────────────────────────────────
log "Restarting backend (PM2)..."
if pm2 describe "$BACKEND_NAME" &>/dev/null; then
  pm2 restart "$BACKEND_NAME"
else
  cd "$APP_DIR/apps/backend"
  pm2 start dist/main.js \
    --name "$BACKEND_NAME" \
    --max-memory-restart 512M \
    --env production
  cd "$APP_DIR"
fi
pm2 save

# ── 8. Build web frontend ────────────────────────────────────────────────────
log "Building @quizparty/web..."
pnpm --filter @quizparty/web build

log "Publishing web build to $WEB_PUBLIC..."
mkdir -p "$WEB_PUBLIC"
cp -r "$WEB_DIST/." "$WEB_PUBLIC/"

# ── 9. Reload Nginx (syntax check first) ─────────────────────────────────────
log "Reloading Nginx..."
nginx -t && systemctl reload nginx

# ── Done ─────────────────────────────────────────────────────────────────────
log "Deploy complete!"
pm2 status
docker compose ps
