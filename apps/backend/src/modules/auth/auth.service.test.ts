import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../database/prisma.service';
import type { RedisService } from '../../infrastructure/redis.service';
import { RedisFake } from '../../test/redis-fake';
import { hashPassword } from './auth.crypto';
import { AuthService } from './auth.service';

const CONF: Record<string, string> = {
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '30d',
  JWT_ACCESS_SECRET: 'test-access-secret-0123456789',
  JWT_REFRESH_SECRET: 'test-refresh-secret-0123456789',
};

const configStub = {
  get: (key: string, def?: unknown) => CONF[key] ?? def,
} as unknown as ConfigService;

describe('AuthService', () => {
  let fake: RedisFake;
  let findUnique: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let auth: AuthService;
  let user: Record<string, unknown>;

  beforeEach(async () => {
    fake = new RedisFake();
    const passwordHash = await hashPassword('pw');
    user = {
      id: 'u1',
      email: 'a@b.c',
      displayName: 'Admin',
      role: 'ADMIN',
      avatarUrl: null,
      passwordHash,
    };
    findUnique = vi.fn().mockResolvedValue(user);
    create = vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => ({
      id: 'author-1',
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      avatarUrl: null,
      passwordHash: data.passwordHash,
    }));
    const prismaStub = {
      user: { findUnique, create, update: vi.fn() },
    } as unknown as PrismaService;
    const redisStub = { client: fake } as unknown as RedisService;
    auth = new AuthService(configStub, prismaStub, redisStub, new JwtService({}));
  });

  const refreshKeys = () => fake.keys('auth:refresh:');

  it('logs in with valid credentials and stores a refresh session', async () => {
    const session = await auth.login({ email: 'A@B.C', password: 'pw' });
    expect(session.user.id).toBe('u1');
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    expect(session.accessToken).not.toBe(session.refreshToken);
    expect(refreshKeys()).toHaveLength(1);
  });

  it('rejects an invalid password', async () => {
    await expect(auth.login({ email: 'a@b.c', password: 'nope' })).rejects.toThrow();
  });

  it('rejects an unknown user', async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(auth.login({ email: 'x@y.z', password: 'pw' })).rejects.toThrow();
  });

  it('registers a new author and stores a refresh session', async () => {
    findUnique.mockResolvedValueOnce(null);

    const session = await auth.register({
      email: ' New.Author@QuizParty.dev ',
      name: 'New Author',
      password: 'party2026',
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new.author@quizparty.dev',
        displayName: 'New Author',
        role: 'AUTHOR',
      }),
    });
    expect(session.user.role).toBe('AUTHOR');
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    expect(refreshKeys()).toHaveLength(1);
  });

  it('rejects registration for an existing email', async () => {
    await expect(
      auth.register({ email: 'a@b.c', name: 'Existing', password: 'party2026' }),
    ).rejects.toThrow();
    expect(create).not.toHaveBeenCalled();
  });

  it('rotates the refresh session and rejects reuse of the old token', async () => {
    const s1 = await auth.login({ email: 'a@b.c', password: 'pw' });
    const oldKey = refreshKeys()[0];

    const s2 = await auth.refresh(s1.refreshToken);
    expect(s2.refreshToken).not.toBe(s1.refreshToken);

    const keys = refreshKeys();
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toBe(oldKey);

    // Старый refresh-токен больше не действителен (сессия удалена).
    await expect(auth.refresh(s1.refreshToken)).rejects.toThrow();
  });

  it('logout revokes the refresh session', async () => {
    const session = await auth.login({ email: 'a@b.c', password: 'pw' });
    await auth.logout(session.refreshToken);
    expect(refreshKeys()).toHaveLength(0);
    await expect(auth.refresh(session.refreshToken)).rejects.toThrow();
  });
});
