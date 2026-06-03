import type { RoundStartEvent, TimerTickEvent } from '@quizparty/shared';
import type { TvRoom } from '@shared/types/tv';

export function makeTvGameJoinPayload(
  room: TvRoom,
  playerId: string,
  playerToken?: string,
) {
  return {
    roomCode: room.roomCode,
    playerId,
    nickname: 'TV ведущий',
    avatarId: 'popcorn-mascot',
    ...(playerToken ? { playerToken } : {}),
  };
}

export function buildInitialTimer(round: RoundStartEvent): TimerTickEvent {
  const answerStartTime = round.answerStartTime;
  const isReading =
    typeof answerStartTime === 'number' && answerStartTime > round.serverTime;
  const targetTime = isReading ? answerStartTime : round.roundEndTime;
  const totalMs = isReading
    ? targetTime - round.serverTime
    : round.roundEndTime - (answerStartTime ?? round.serverTime);

  return {
    remainingSeconds: Math.max(
      0,
      Math.ceil((targetTime - round.serverTime) / 1000),
    ),
    totalSeconds: Math.max(1, Math.ceil(totalMs / 1000)),
    serverTime: round.serverTime,
    stage: isReading ? 'reading' : 'answering',
  };
}
