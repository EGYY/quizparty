import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

const JWT_ALG = 'HS256';
const JWT_TYP = 'JWT';
const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('base64url');
  const key = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('base64url');
  return `scrypt:${salt}:${key}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash === 'local-dev-placeholder') {
    return password === 'local-dev';
  }

  const [method, salt, key] = storedHash.split(':');
  if (method !== 'scrypt' || !salt || !key) return false;

  const expected = Buffer.from(key, 'base64url');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function signJwt(payload: Record<string, unknown>, secret: string, ttlMs: number): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = Math.floor((Date.now() + ttlMs) / 1000);
  const header = base64UrlJson({ alg: JWT_ALG, typ: JWT_TYP });
  const body = base64UrlJson({ ...payload, iat: now, exp });
  const signature = sign(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

export function verifyJwt<T extends Record<string, unknown>>(
  token: string,
  secret: string,
): T & { exp: number; iat: number } {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new UnauthorizedException('Malformed token');
  }

  const expected = sign(`${parts[0]}.${parts[1]}`, secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(parts[2]);
  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    throw new UnauthorizedException('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as T & {
    exp?: unknown;
    iat?: unknown;
  };

  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedException('Token expired');
  }
  if (typeof payload.iat !== 'number') {
    throw new UnauthorizedException('Token missing issued-at');
  }

  return payload as T & { exp: number; iat: number };
}

export function hashToken(token: string): string {
  return createHmac('sha256', 'quizparty-refresh-token').update(token).digest('base64url');
}

function base64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
