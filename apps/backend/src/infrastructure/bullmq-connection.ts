import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Dedicated Redis connections for BullMQ.
 * BullMQ requires maxRetriesPerRequest: null on its connections,
 * which differs from the regular Redis client config.
 */
@Injectable()
export class BullMqConnectionService implements OnModuleDestroy {
  readonly queue: Redis;
  readonly worker: Redis;

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.queue = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.worker = new Redis(redisUrl, { maxRetriesPerRequest: null });
  }

  async onModuleDestroy() {
    await Promise.all([this.queue.quit(), this.worker.quit()]);
  }
}
