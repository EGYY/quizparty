import { BASE_SCORE } from './constants';

export function calculateScore(
  isCorrect: boolean,
  remainingSeconds: number,
  totalSeconds: number,
  currentStreak: number,
): number {
  if (!isCorrect) return 0;

  const boundedRemaining = Math.max(0, Math.min(remainingSeconds, totalSeconds));
  const speedBonus = Math.floor((boundedRemaining / totalSeconds) * 500);
  const baseWithSpeed = BASE_SCORE + speedBonus;

  const streakMultiplier = currentStreak >= 5 ? 2.0 : currentStreak >= 3 ? 1.5 : 1.0;

  return Math.floor(baseWithSpeed * streakMultiplier);
}
