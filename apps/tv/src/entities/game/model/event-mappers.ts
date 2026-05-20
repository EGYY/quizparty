import { wsErrorEventSchema } from '@quizparty/shared';
import type { RoundStartEvent, TimerTickEvent } from '@quizparty/shared';
import type { TvRoom } from '@shared/types/tv';

export function readGameSocketError(payload: unknown): string {
  const parsed = wsErrorEventSchema.safeParse(payload);
  if (parsed.success) return parsed.data.message;
  if (payload instanceof Error) return payload.message;
  return 'Ошибка realtime-соединения';
}

export function makeTvGameJoinPayload(room: TvRoom, playerId: string) {
  return {
    roomCode: room.roomCode,
    playerId,
    nickname: 'TV ведущий',
    avatarId: 'popcorn-mascot',
  };
}

export function buildInitialTimer(round: RoundStartEvent): TimerTickEvent {
  return {
    remainingSeconds: Math.max(
      0,
      Math.ceil((round.roundEndTime - Date.now()) / 1000),
    ),
    totalSeconds: Math.max(
      1,
      Math.ceil((round.roundEndTime - round.serverTime) / 1000),
    ),
    serverTime: Date.now(),
  };
}
