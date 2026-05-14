import { Injectable } from '@nestjs/common';
import { LobbyState, ROOM_TTL_SECONDS } from '@quizparty/shared';
import { randomUUID } from 'node:crypto';
import { RedisService } from './redis.service';

const roomStateKey = (roomCode: string) => `room:${roomCode}:state`;
const roomPatchLockKey = (roomCode: string) => `room:${roomCode}:state-lock`;
const PATCH_LOCK_RETRY_COUNT = 100;
const PATCH_LOCK_RETRY_DELAY_MS = 25;
const PATCH_LOCK_TTL_MS = 5000;

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
    const key = roomStateKey(roomCode);
    const lockKey = roomPatchLockKey(roomCode);
    const lockToken = randomUUID();
    let lockAcquired = false;

    for (let attempt = 0; attempt < PATCH_LOCK_RETRY_COUNT; attempt += 1) {
      const result = await this.redis.client.set(lockKey, lockToken, 'PX', PATCH_LOCK_TTL_MS, 'NX');
      if (result === 'OK') {
        lockAcquired = true;
        break;
      }

      await delay(PATCH_LOCK_RETRY_DELAY_MS);
    }

    if (!lockAcquired) {
      throw new Error(`Failed to patch room ${roomCode}: room state is locked`);
    }

    try {
      const raw = await this.redis.client.get(key);
      if (!raw) return null;

      const current = JSON.parse(raw) as LobbyState;
      const next = patcher(current);
      await this.setRoomState(roomCode, next);
      return next;
    } finally {
      await this.redis.client.eval(releaseLockScript, 1, lockKey, lockToken);
    }
  }

  async deleteRoomState(roomCode: string): Promise<void> {
    await this.redis.client.del(roomStateKey(roomCode));
  }
}
