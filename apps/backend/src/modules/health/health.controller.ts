import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis.service';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @ApiOperation({ summary: 'Check DB + Redis connectivity' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok', db: true, redis: true } } })
  @ApiResponse({ status: 503, schema: { example: { status: 'error', db: false, redis: true } } })
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
