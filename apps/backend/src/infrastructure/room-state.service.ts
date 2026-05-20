import { Injectable } from '@nestjs/common';
import { LobbyState, ROOM_TTL_SECONDS } from '@quizparty/shared';
import { RedisService } from './redis.service';
import { withRedisLock } from './redis-lock';

const roomStateKey = (roomCode: string) => `room:${roomCode}:state`;
const roomPatchLockKey = (roomCode: string) => `room:${roomCode}:state-lock`;

@Injectable()
export class RoomStateService {
  constructor(private readonly redis: RedisService) {}

  async getRoomState(roomCode: string): Promise<LobbyState | null> {
    const raw = await this.redis.client.get(roomStateKey(roomCode));
    return raw ? (JSON.parse(raw) as LobbyState) : null;
  }

  async setRoomState(roomCode: string, state: LobbyState): Promise<void> {
    await this.redis.client.set(
      roomStateKey(roomCode),
      JSON.stringify(state),
      'EX',
      ROOM_TTL_SECONDS,
    );
  }

  async patchRoomState(
    roomCode: string,
    patcher: (state: LobbyState) => LobbyState,
  ): Promise<LobbyState | null> {
    return withRedisLock(this.redis.client, roomPatchLockKey(roomCode), async () => {
      const raw = await this.redis.client.get(roomStateKey(roomCode));
      if (!raw) return null;

      const current = JSON.parse(raw) as LobbyState;
      const next = patcher(current);
      await this.setRoomState(roomCode, next);
      return next;
    });
  }

  async deleteRoomState(roomCode: string): Promise<void> {
    await this.redis.client.del(roomStateKey(roomCode));
  }
}
