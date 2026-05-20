import type { Player } from '@quizparty/shared';
import { describe, expect, it } from 'vitest';
import { RedisFake } from '../test/redis-fake';
import type { RedisService } from './redis.service';
import { RoomStateService } from './room-state.service';

const makeService = (fake: RedisFake) =>
  new RoomStateService({ client: fake } as unknown as RedisService);

describe('RoomStateService.patchRoomState', () => {
  it('serializes concurrent patches without lost updates', async () => {
    const service = makeService(new RedisFake());
    await service.setRoomState('R', { players: [] } as never);

    const N = 20;
    await Promise.all(
      Array.from({ length: N }, (_, index) =>
        service.patchRoomState('R', (state) => ({
          ...state,
          players: [...state.players, { id: index } as unknown as Player],
        })),
      ),
    );

    const final = await service.getRoomState('R');
    expect(final?.players).toHaveLength(N);
  });

  it('returns null when the room state is absent', async () => {
    const service = makeService(new RedisFake());
    expect(await service.patchRoomState('missing', (state) => state)).toBeNull();
  });

  it('applies the patcher and persists the result', async () => {
    const fake = new RedisFake();
    const service = makeService(fake);
    await service.setRoomState('R', { phase: 'LOBBY' } as never);

    const next = await service.patchRoomState('R', (state) => ({
      ...state,
      phase: 'STARTING' as never,
    }));

    expect((next as unknown as { phase: string }).phase).toBe('STARTING');
    expect((await service.getRoomState('R')) as unknown as { phase: string }).toEqual({
      phase: 'STARTING',
    });
  });
});
