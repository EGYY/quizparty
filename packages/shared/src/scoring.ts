import { BASE_SCORE } from './constants';

/**
 * Вычисляет очки за ответ в режиме CLASSIC.
 * В режиме REACTION не используется — там очко всегда равно 1 и только
 * для самого быстрого игрока (см. endRound в gameplay.service.ts).
 *
 * Формула:
 *   базовые очки (1000) + бонус скорости (0–500) × множитель серии
 *
 * Множитель серии:
 *   серия < 3  → ×1.0
 *   серия 3–4  → ×1.5
 *   серия ≥ 5  → ×2.0
 */
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
