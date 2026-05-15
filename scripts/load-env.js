// Cross-platform env loader: loads .env (or .env.example as fallback) then runs a command.
const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { resolve, join } = require('path');

const root = resolve(__dirname, '..');
const envPath = join(root, '.env');
const fallbackPath = join(root, '.env.example');

const file = existsSync(envPath) ? envPath : fallbackPath;
const env = {};

readFileSync(file, 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    env[key] = val;
  });

Object.assign(process.env, env);

const cmd = process.argv.slice(2).join(' ');
execSync(cmd, { stdio: 'inherit', shell: true });
