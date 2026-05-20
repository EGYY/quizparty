import type Redis from 'ioredis';
import { describe, expect, it } from 'vitest';
import { RedisFake } from '../test/redis-fake';
import { withRedisLock } from './redis-lock';

const asClient = (fake: RedisFake) => fake as unknown as Redis;

describe('withRedisLock', () => {
  it('runs the callback under the lock and returns its result', async () => {
    const fake = new RedisFake();
    const result = await withRedisLock(asClient(fake), 'k', () => Promise.resolve('value'));
    expect(result).toBe('value');
    // Лок снят — повторный захват того же ключа возможен.
    expect(await withRedisLock(asClient(fake), 'k', () => Promise.resolve('again'))).toBe(
      'again',
    );
  });

  it('serializes concurrent critical sections on the same key', async () => {
    const fake = new RedisFake();
    let active = 0;
    let maxActive = 0;

    const task = () =>
      withRedisLock(asClient(fake), 'shared', async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
      });

    await Promise.all(Array.from({ length: 10 }, task));
    expect(maxActive).toBe(1);
  });

  it('releases the lock even if the callback throws', async () => {
    const fake = new RedisFake();
    await expect(
      withRedisLock(asClient(fake), 'k2', () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');

    // Несмотря на исключение, лок освобождён.
    expect(await withRedisLock(asClient(fake), 'k2', () => Promise.resolve(42))).toBe(42);
  });

  it('does not block independent keys', async () => {
    const fake = new RedisFake();
    const [a, b] = await Promise.all([
      withRedisLock(asClient(fake), 'a', () => Promise.resolve('A')),
      withRedisLock(asClient(fake), 'b', () => Promise.resolve('B')),
    ]);
    expect([a, b]).toEqual(['A', 'B']);
  });
});
