import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const SCRYPT_KEY_LENGTH = 64;

const scrypt = promisify(scryptCallback);

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64url');
  const key = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Dev-only convenience login for seeded placeholder accounts. Never in production.
  if (!isProduction() && storedHash === 'local-dev-placeholder') {
    return password === 'local-dev';
  }

  const [method, salt, key] = storedHash.split(':');
  if (method !== 'scrypt' || !salt || !key) return false;

  const expected = Buffer.from(key, 'base64url');
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// HMAC отпечаток refresh-токена для хранения в Redis (не JWT — не трогаем).
export function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('base64url');
}
