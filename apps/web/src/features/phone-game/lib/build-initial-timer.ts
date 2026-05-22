import type { RoundStartEvent, TimerTickEvent } from '@quizparty/shared';

export function buildInitialTimer(round: RoundStartEvent): TimerTickEvent {
  const now = Date.now();
  const answerStartTime = round.answerStartTime;
  const isReading = typeof answerStartTime === 'number' && answerStartTime > now;
  const targetTime = isReading ? answerStartTime : round.roundEndTime;
  const totalMs = isReading
    ? targetTime - round.serverTime
    : round.roundEndTime - (answerStartTime ?? round.serverTime);

  return {
    remainingSeconds: Math.max(0, Math.ceil((targetTime - now) / 1000)),
    totalSeconds: Math.max(1, Math.ceil(totalMs / 1000)),
    serverTime: now,
    stage: isReading ? 'reading' : 'answering',
  };
}
