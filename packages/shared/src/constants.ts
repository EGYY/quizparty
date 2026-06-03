import { GameMode } from './enums';

export const MAX_PLAYERS = 10;
/** Время жизни комнаты без активных игроков (30 минут). */
export const ROOM_TTL_SECONDS = 30 * 60;
/** Длительность окна реакций (эмодзи) после показа правильного ответа. */
export const REACTION_WINDOW_SECONDS = 10;
export const REACTION_RATE_LIMIT = {
  maxEvents: 15,
  windowSeconds: 5,
} as const;

/** Базовые очки за правильный ответ без бонусов. */
export const BASE_SCORE = 1000;

/** Настройки режимов игры.
 *
 *  questionDurationMs   — время на ответ после открытия вариантов.
 *  answerRevealDelayMs  — задержка перед показом вариантов (устаревшее поле:
 *                         сервер вычисляет задержку динамически по медиа вопроса,
 *                         см. computeRoundTiming в gameplay.service.ts).
 *  revealDurationMs     — длительность экрана правильного ответа.
 *  roundIntroDurationMs — анимация-заставка перед раундом. */
export const GAME_MODE_SETTINGS = {
  [GameMode.CLASSIC]: {
    questionDurationMs: 15_000,
    answerRevealDelayMs: 0,
    revealDurationMs: 15_000,
    roundIntroDurationMs: 2_500,
    showExplanation: true,
  },
  [GameMode.REACTION]: {
    questionDurationMs: 10_000,
    answerRevealDelayMs: 3_000,
    revealDurationMs: 10_000,
    roundIntroDurationMs: 2_000,
    showExplanation: true,
  },
} as const;

export const DEFAULT_REACTIONS = ['😂', '❤️', '🔥', '😱', '👏', '🎉'] as const;

/** Длительность полноэкранного отсчёта «3-2-1» перед появлением
 *  вариантов ответов в режиме REACTION. */
export const REACTION_COUNTDOWN_MS = 3_000;

/** Время чтения текстового/картиночного вопроса в режиме REACTION
 *  до начала отсчёта. Для аудио/видео используется длительность клипа. */
export const REACTION_TEXT_READ_MS = 10_000;

/** Запасная длительность AV-клипа, если у медиа не задан endMs
 *  и не указан durationSeconds. */
export const DEFAULT_AV_CLIP_MS = 10_000;
