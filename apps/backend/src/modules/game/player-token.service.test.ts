import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import { PlayerTokenService } from './player-token.service';

const makeService = (overrides: Record<string, unknown> = {}) => {
  const conf: Record<string, unknown> = {
    PLAYER_TOKEN_SECRET: 'player-token-secret-0123456789',
    PLAYER_TOKEN_EXPIRES_IN: '1d',
    PLAYER_TOKEN_STRICT: false,
    ...overrides,
  };
  const configStub = {
    get: (key: string, def?: unknown) => conf[key] ?? def,
    getOrThrow: (key: string) => {
      const value = conf[key];
      if (value === undefined) throw new Error(`Missing ${key}`);
      return value;
    },
  } as unknown as ConfigService;
  return new PlayerTokenService(configStub, new JwtService({}));
};

describe('PlayerTokenService', () => {
  it('signs and verifies a token bound to (playerId, roomCode)', () => {
    const service = makeService();
    const token = service.sign('p1', 'QUIZ-ABCD12');
    const result = service.verify(token, { playerId: 'p1', roomCode: 'QUIZ-ABCD12' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.playerId).toBe('p1');
  });

  it('rejects a token presented for a different room', () => {
    const service = makeService();
    const token = service.sign('p1', 'QUIZ-AAA111');
    const result = service.verify(token, { playerId: 'p1', roomCode: 'QUIZ-BBB222' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('room_mismatch');
  });

  it('rejects a token presented for a different player id', () => {
    const service = makeService();
    const token = service.sign('p1', 'QUIZ-ABCD12');
    const result = service.verify(token, { playerId: 'p2', roomCode: 'QUIZ-ABCD12' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('player_mismatch');
  });

  it('rejects a tampered or malformed token', () => {
    const service = makeService();
    const token = service.sign('p1', 'QUIZ-ABCD12');
    const tampered = `${token.slice(0, -2)}xx`;
    expect(service.verify('not-a-jwt', { playerId: 'p1', roomCode: 'QUIZ-ABCD12' }).ok).toBe(false);
    expect(service.verify(tampered, { playerId: 'p1', roomCode: 'QUIZ-ABCD12' }).ok).toBe(false);
  });

  it('honours PLAYER_TOKEN_STRICT from config', () => {
    expect(makeService().isStrict).toBe(false);
    expect(makeService({ PLAYER_TOKEN_STRICT: true }).isStrict).toBe(true);
  });
});
