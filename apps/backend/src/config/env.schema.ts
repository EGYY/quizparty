import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  WEB_ORIGIN: z
    .string()
    .refine(
      (v) => v.split(',').every((o) => z.string().url().safeParse(o.trim()).success),
      { message: 'Invalid url' },
    )
    .default('http://localhost:5173'),
  TV_JOIN_BASE_URL: z.string().url().default('http://localhost:5173/join'),
  BACKEND_PUBLIC_URL: z.string().url().default('http://localhost:3001'),
  UPLOAD_ROOT_DIR: z.string().min(1).default('uploads'),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Player-token: серверная подпись для анти-спуфинга playerId по сокету.
  PLAYER_TOKEN_SECRET: z.string().min(16),
  PLAYER_TOKEN_EXPIRES_IN: z.string().default('1d'),
  // Lax по умолчанию (legacy без токена принимается с предупреждением).
  // STRICT=true — отвергать JOIN_LOBBY без токена для уже известного playerId.
  PLAYER_TOKEN_STRICT: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(false),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return result.data;
}
