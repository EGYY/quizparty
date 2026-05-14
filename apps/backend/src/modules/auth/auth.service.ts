import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthSession, LoginRequest, UserSummary } from '@quizparty/shared';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis.service';
import { hashPassword, hashToken, signJwt, verifyJwt, verifyPassword } from './auth.crypto';
import type { AccessTokenPayload, AuthUser, RefreshTokenPayload } from './auth.types';

const REFRESH_PREFIX = 'auth:refresh:';

type RefreshSessionRecord = {
  userId: string;
  tokenHash: string;
  expiresAt: number;
  createdAt: number;
};

@Injectable()
export class AuthService {
  private readonly accessTtlMs: number;
  private readonly refreshTtlMs: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    this.accessTtlMs = parseDurationMs(this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'));
    this.refreshTtlMs = parseDurationMs(this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'));
    this.accessSecret = this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret-change-me');
    this.refreshSecret = this.config.get<string>(
      'JWT_REFRESH_SECRET',
      'dev-refresh-secret-change-me',
    );
  }

  get refreshCookieName(): string {
    return 'quizparty_refresh';
  }

  get refreshCookieMaxAgeMs(): number {
    return this.refreshTtlMs;
  }

  async login(credentials: LoginRequest): Promise<AuthSession & { refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });

    if (!user || !verifyPassword(credentials.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.passwordHash === 'local-dev-placeholder') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(credentials.password) },
      });
    }

    return this.createSession(mapUser(user));
  }

  async refresh(refreshToken: string | undefined): Promise<AuthSession & { refreshToken: string }> {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const payload = verifyJwt<RefreshTokenPayload>(refreshToken, this.refreshSecret);
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');

    const sessionKey = this.sessionKey(payload.sid);
    const stored = await this.redis.client.get(sessionKey);
    if (!stored) throw new UnauthorizedException('Refresh session expired');

    const session = JSON.parse(stored) as RefreshSessionRecord;
    if (
      session.userId !== payload.sub ||
      session.expiresAt < Date.now() ||
      session.tokenHash !== hashToken(refreshToken)
    ) {
      await this.redis.client.del(sessionKey);
      throw new UnauthorizedException('Refresh session revoked');
    }

    await this.redis.client.del(sessionKey);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    return this.createSession(mapUser(user));
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = verifyJwt<RefreshTokenPayload>(refreshToken, this.refreshSecret);
      if (payload.type === 'refresh') {
        await this.redis.client.del(this.sessionKey(payload.sid));
      }
    } catch {
      // The client is logging out anyway, so stale or malformed refresh tokens are harmless.
    }
  }

  async verifyAccessToken(accessToken: string): Promise<AuthUser> {
    const payload = verifyJwt<AccessTokenPayload>(accessToken, this.accessSecret);
    if (payload.type !== 'access') throw new UnauthorizedException('Invalid access token');

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');
    return mapUser(user);
  }

  private async createSession(user: AuthUser): Promise<AuthSession & { refreshToken: string }> {
    const sessionId = randomUUID();
    const accessToken = signJwt(
      {
        type: 'access',
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.accessSecret,
      this.accessTtlMs,
    );
    const refreshToken = signJwt(
      {
        type: 'refresh',
        sub: user.id,
        sid: sessionId,
      },
      this.refreshSecret,
      this.refreshTtlMs,
    );
    const session: RefreshSessionRecord = {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: Date.now() + this.refreshTtlMs,
      createdAt: Date.now(),
    };

    await this.redis.client.set(
      this.sessionKey(sessionId),
      JSON.stringify(session),
      'PX',
      this.refreshTtlMs,
    );

    return { accessToken, refreshToken, user };
  }

  private sessionKey(sessionId: string): string {
    return `${REFRESH_PREFIX}${sessionId}`;
  }
}

function mapUser(user: {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
}): UserSummary {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role as UserSummary['role'],
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
  };
}

function parseDurationMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)?$/.exec(value.trim());
  if (!match || !match[1]) return 15 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2] ?? 'ms';
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] ?? 1);
}
