import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis.service';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check(): Promise<{ status: string; db: boolean; redis: boolean }> {
    const [db, redis] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      this.redis.client
        .ping()
        .then((reply) => reply === 'PONG')
        .catch(() => false),
    ]);

    if (!db || !redis) {
      throw new ServiceUnavailableException({ status: 'error', db, redis });
    }
    return { status: 'ok', db, redis };
  }
}
