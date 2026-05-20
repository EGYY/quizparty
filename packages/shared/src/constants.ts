import { GameMode } from './enums';

export const MAX_PLAYERS = 10;
export const ROOM_TTL_SECONDS = 30 * 60;
export const REACTION_WINDOW_SECONDS = 10;
export const REACTION_RATE_LIMIT = {
  maxEvents: 10,
  windowSeconds: 5,
} as const;

export const BASE_SCORE = 1000;

export const GAME_MODE_SETTINGS = {
  [GameMode.FAST]: {
    questionDurationMs: 5_000,
    revealDurationMs: 8_000,
    roundIntroDurationMs: 1_500,
    showExplanation: false,
  },
  [GameMode.CLASSIC]: {
    questionDurationMs: 10_000,
    revealDurationMs: 12_000,
    roundIntroDurationMs: 2_500,
    showExplanation: true,
  },
} as const;

export const DEFAULT_REACTIONS = ['😂', '❤️', '🔥', '😱', '👏', '🎉'] as const;
