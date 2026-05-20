import { Injectable } from '@nestjs/common';
import { ROOM_TTL_SECONDS } from '@quizparty/shared';
import { RedisService } from '../../infrastructure/redis.service';
import { withRedisLock } from '../../infrastructure/redis-lock';
import type { InternalGameState } from './game.types';

const gameStateKey = (roomCode: string) => `room:${roomCode}:game`;
const gamePatchLockKey = (roomCode: string) => `room:${roomCode}:game-lock`;

@Injectable()
export class GameStateService {
  constructor(private readonly redis: RedisService) {}

  async getGameState(roomCode: string): Promise<InternalGameState | null> {
    const raw = await this.redis.client.get(gameStateKey(roomCode));
    return raw ? (JSON.parse(raw) as InternalGameState) : null;
  }

  async setGameState(roomCode: string, state: InternalGameState): Promise<void> {
    await this.redis.client.set(
      gameStateKey(roomCode),
      JSON.stringify(state),
      'EX',
      ROOM_TTL_SECONDS,
    );
  }

  async patchGameState(
    roomCode: string,
    patcher: (state: InternalGameState) => InternalGameState,
  ): Promise<InternalGameState | null> {
    return withRedisLock(this.redis.client, gamePatchLockKey(roomCode), async () => {
      const current = await this.getGameState(roomCode);
      if (!current) return null;

      const next = patcher(current);
      await this.setGameState(roomCode, next);
      return next;
    });
  }

  async deleteGameState(roomCode: string): Promise<void> {
    await this.redis.client.del(gameStateKey(roomCode));
  }
}
