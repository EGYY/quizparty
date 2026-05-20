import { describe, expect, it } from 'vitest';
import { hashPassword, hashToken, verifyPassword } from './auth.crypto';

describe('password hashing', () => {
  it('round-trips a password', async () => {
    const hash = await hashPassword('s3cret');
    expect(hash).toMatch(/^scrypt:[^:]+:[^:]+$/);
    expect(await verifyPassword('s3cret', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('uses a distinct random salt per call', async () => {
    expect(await hashPassword('x')).not.toBe(await hashPassword('x'));
  });

  it('honours the dev placeholder only outside production', async () => {
    expect(await verifyPassword('local-dev', 'local-dev-placeholder')).toBe(true);
    expect(await verifyPassword('nope', 'local-dev-placeholder')).toBe(false);
  });

  it('rejects malformed stored hashes', async () => {
    expect(await verifyPassword('x', 'garbage')).toBe(false);
    expect(await verifyPassword('x', 'scrypt:onlysalt')).toBe(false);
  });
});

describe('hashToken', () => {
  it('is deterministic per secret and secret-sensitive', () => {
    expect(hashToken('tok', 's1')).toBe(hashToken('tok', 's1'));
    expect(hashToken('tok', 's1')).not.toBe(hashToken('tok', 's2'));
    expect(hashToken('a', 's1')).not.toBe(hashToken('b', 's1'));
  });
});
