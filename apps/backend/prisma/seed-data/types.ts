// ─────────────────────────────────────────────────────────────────────────────
// Seed-data types — mirrors Prisma enums without importing PrismaClient
// so individual quiz files stay lightweight.
// ─────────────────────────────────────────────────────────────────────────────

export type QuizCategory =
  | 'CINEMA'
  | 'MUSIC'
  | 'HISTORY'
  | 'SCIENCE'
  | 'GAMES'
  | 'SPORTS'
  | 'PARTY'
  | 'KIDS'
  | 'ADULT'
  | 'ART';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type SeedMediaType = 'IMAGE' | 'AUDIO' | 'VIDEO';

// ── Single question (no quizId — added in seed.ts loop) ──────────────────────

export interface SeedQuestion {
  questionText: string;
  /** Exactly 4 answer options */
  options: [string, string, string, string];
  /** 0-based index of the correct option */
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  /** 0-based position within the quiz */
  order: number;

  // ── Optional media attached to the question ──
  mediaUrl?: string;
  mediaType?: SeedMediaType;
  mediaAlt?: string;
  mediaStartMs?: number;
  mediaEndMs?: number;
  mediaPosterUrl?: string;
  /** Description of an image/audio that can be generated later */
  mediaPrompt?: string;

  // ── Optional media shown after the answer is revealed ──
  revealMediaUrl?: string;
  revealMediaType?: SeedMediaType;
  revealMediaAlt?: string;
  revealMediaStartMs?: number;
  revealMediaEndMs?: number;
  revealMediaPosterUrl?: string;
  revealMediaPrompt?: string;
}

// ── Full quiz seed definition ─────────────────────────────────────────────────

export interface SeedQuiz {
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: Difficulty;
  coverUrl: string;
  squareCoverUrl: string;
  themeColor: string;
  recommendedPlayersMin: number;
  recommendedPlayersMax: number;
  estimatedMinutes: number;
  tags: string[];
  /** Must contain exactly 12 questions with order 0..11 */
  questions: SeedQuestion[];
}
