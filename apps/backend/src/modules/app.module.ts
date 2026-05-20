import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from '../config/env.schema';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../infrastructure/redis.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { HealthModule } from './health/health.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    QuizzesModule,
    RoomsModule,
    GameModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
