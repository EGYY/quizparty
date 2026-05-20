import { randomUUID } from 'node:crypto';
import type Redis from 'ioredis';

const LOCK_RETRY_COUNT = 100;
const LOCK_RETRY_DELAY_MS = 25;
const LOCK_TTL_MS = 5000;

// Освобождаем лок только если токен наш (защита от снятия чужого лока по TTL).
const releaseLockScript = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Выполняет fn под распределённым Redis-локом (SET NX PX + Lua-release).
 * Один и тот же примитив используется для room- и game-state, чтобы
 * read-modify-write одного ключа был сериализован (без потерянных обновлений).
 */
export async function withRedisLock<T>(
  client: Redis,
  lockKey: string,
  fn: () => Promise<T>,
): Promise<T> {
  const lockToken = randomUUID();
  let lockAcquired = false;

  for (let attempt = 0; attempt < LOCK_RETRY_COUNT; attempt += 1) {
    const result = await client.set(lockKey, lockToken, 'PX', LOCK_TTL_MS, 'NX');
    if (result === 'OK') {
      lockAcquired = true;
      break;
    }
    await delay(LOCK_RETRY_DELAY_MS);
  }

  if (!lockAcquired) {
    throw new Error(`Failed to acquire lock ${lockKey}`);
  }

  try {
    return await fn();
  } finally {
    await client.eval(releaseLockScript, 1, lockKey, lockToken);
  }
}
