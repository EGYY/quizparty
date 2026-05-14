import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '../config/env.schema';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../infrastructure/redis.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    QuizzesModule,
    RoomsModule,
    GameModule,
  ],
})
export class AppModule {}
