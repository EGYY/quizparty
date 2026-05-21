import { z } from 'zod';
import {
  AdminSort,
  Difficulty,
  GamePhase,
  GameMode,
  LobbyPlayerStatus,
  MediaType,
  PlayerConnectionStatus,
  QualityWarningCode,
  QuizCategory,
  QuizStatus,
  ReviewRejectionReason,
  Role,
} from './enums';
import { GAME_MODE_SETTINGS, MAX_PLAYERS } from './constants';
import { ErrorCode } from './errors';

export const uuidSchema = z.string().uuid();

export const mediaUrlSchema = z
  .string()
  .min(1)
  .refine((v) => v.startsWith('/') || z.string().url().safeParse(v).success, {
    message: 'Invalid url',
  });

export const mediaSchema = z
  .object({
    url: mediaUrlSchema,
    type: z.nativeEnum(MediaType),
    alt: z.string().max(160).optional(),
    startMs: z.number().int().nonnegative().optional(),
    endMs: z.number().int().positive().optional(),
    posterUrl: mediaUrlSchema.optional(),
    prompt: z.string().max(160).optional(),
    durationSeconds: z.number().int().positive().optional(),
    sizeBytes: z.number().int().positive().optional(),
  })
  .refine(
    (media) =>
      typeof media.startMs !== 'number' ||
      typeof media.endMs !== 'number' ||
      media.endMs > media.startMs,
    {
      message: 'endMs must be greater than startMs',
      path: ['endMs'],
    },
  );

export const quizCategorySchema = z.nativeEnum(QuizCategory);
export const difficultySchema = z.nativeEnum(Difficulty);
export const gameModeSchema = z.nativeEnum(GameMode);

export const quizCardSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(80),
  description: z.string().max(220).optional(),
  category: quizCategorySchema,
  difficulty: difficultySchema,
  status: z.nativeEnum(QuizStatus),
  coverUrl: mediaUrlSchema.optional(),
  squareCoverUrl: mediaUrlSchema.optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  authorName: z.string().min(1).max(80),
  questionCount: z.number().int().nonnegative(),
  estimatedMinutes: z.number().int().positive().optional(),
  recommendedPlayersMin: z.number().int().positive().optional(),
  recommendedPlayersMax: z.number().int().positive().max(MAX_PLAYERS).optional(),
  rating: z.number().min(0).max(5).optional(),
  playCount: z.number().int().nonnegative().optional(),
  tags: z.array(z.string().min(1).max(32)).default([]),
});

export const quizBrowserQuerySchema = z.object({
  category: quizCategorySchema.default(QuizCategory.ALL),
  search: z.string().max(80).optional(),
  difficulty: difficultySchema.optional(),
  tags: z.array(z.string().min(1).max(32)).default([]),
});

export const quizDetailSchema = quizCardSchema.extend({
  fullDescription: z.string().max(800).optional(),
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const roomSettingsSchema = z.object({
  quizId: uuidSchema,
  difficulty: difficultySchema,
  mode: gameModeSchema,
  questionDurationMs: z.number().int().positive(),
  revealDurationMs: z.number().int().positive(),
});

export const createRoomRequestSchema = z.object({
  quizId: uuidSchema,
  difficulty: difficultySchema,
  mode: gameModeSchema,
});

export const createRoomResponseSchema = z.object({
  roomCode: z.string().regex(/^[A-Z0-9-]{4,12}$/),
  joinUrl: z.string().url(),
  settings: roomSettingsSchema,
});

export const roomSummarySchema = z.object({
  roomCode: z.string().regex(/^[A-Z0-9-]{4,12}$/),
  joinUrl: z.string().url(),
  phase: z.nativeEnum(GamePhase),
  playerCount: z.number().int().nonnegative().max(MAX_PLAYERS),
  maxPlayers: z.literal(MAX_PLAYERS),
  selectedQuiz: quizCardSchema,
  settings: roomSettingsSchema,
});

export const playerSchema = z.object({
  playerId: uuidSchema,
  nickname: z.string().min(1).max(24),
  avatarId: z.string().min(1).max(48),
  score: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  isReady: z.boolean(),
  isHost: z.boolean(),
  joinedAt: z.string().datetime(),
  connectionStatus: z.nativeEnum(PlayerConnectionStatus),
  lobbyStatus: z.nativeEnum(LobbyPlayerStatus),
  rank: z.number().int().positive().optional(),
});

export const lobbyStateSchema = z.object({
  roomCode: z.string(),
  joinUrl: z.string().url(),
  qrVisible: z.boolean(),
  phase: z.nativeEnum(GamePhase).default(GamePhase.LOBBY),
  selectedQuiz: quizCardSchema,
  settings: roomSettingsSchema,
  hostPlayerId: uuidSchema.optional(),
  players: z.array(playerSchema).max(MAX_PLAYERS),
  maxPlayers: z.literal(MAX_PLAYERS),
  // Серверные поля, отправляются ТОЛЬКО присоединившемуся сокету (не
  // транслируются в комнату). Подтверждённый playerId и подписанный токен,
  // которым клиент авторизует последующие JOIN_LOBBY/reconnect (анти-спуфинг).
  playerId: uuidSchema.optional(),
  playerToken: z.string().optional(),
});

export const hostTransferredEventSchema = z.object({
  newHostId: uuidSchema,
  newHostNickname: z.string().min(1).max(24),
});

export const gameStartingEventSchema = z.object({
  countdownSeconds: z.number().int().nonnegative(),
  serverTime: z.number().int().positive(),
  startsAt: z.number().int().positive(),
});

const pausableGamePhaseSchema = z.union([
  z.literal(GamePhase.QUESTION),
  z.literal(GamePhase.ANSWER_REVEAL),
]);

export const gamePausedEventSchema = z.object({
  phase: pausableGamePhaseSchema,
  remainingMs: z.number().int().nonnegative(),
  serverTime: z.number().int().positive(),
});

export const gameResumedEventSchema = z.object({
  phase: pausableGamePhaseSchema,
  remainingMs: z.number().int().nonnegative(),
  serverTime: z.number().int().positive(),
  targetTime: z.number().int().positive(),
});

export const roomClosedEventSchema = z.object({
  roomCode: z.string(),
  reason: z.literal('HOST_ENDED_GAME'),
  serverTime: z.number().int().positive(),
});

export const joinLobbyPayloadSchema = z.object({
  roomCode: z.string().min(4).max(12),
  playerId: uuidSchema.optional(),
  nickname: z.string().min(1).max(24),
  avatarId: z.string().min(1).max(48),
  // Подписанный сервером токен (выдан на первом успешном JOIN_LOBBY).
  // Требуется для повторного захвата playerId — анти-спуфинг.
  playerToken: z.string().min(1).max(512).optional(),
});

export const setPlayerInfoPayloadSchema = z.object({
  nickname: z.string().min(1).max(24),
  avatarId: z.string().min(1).max(48),
});

export const setReadyPayloadSchema = z.object({
  ready: z.boolean(),
});

export const reactionPayloadSchema = z.object({
  emoji: z.string().emoji(),
});

export const reactionEventSchema = z.object({
  id: uuidSchema,
  playerId: uuidSchema,
  emoji: z.string().emoji(),
  createdAt: z.string().datetime(),
});

export const reactionWindowEventSchema = z.object({
  durationSeconds: z.number().int().positive(),
  closesAt: z.number().int().positive(),
  serverTime: z.number().int().positive(),
});

export const questionSchema = z.object({
  id: uuidSchema,
  quizId: uuidSchema,
  questionText: z.string().min(1).max(500),
  media: mediaSchema.optional(),
  options: z.array(z.string().min(1).max(140)).length(4),
  order: z.number().int().nonnegative(),
});

export const roundStartEventSchema = z.object({
  roundNumber: z.number().int().positive(),
  totalRounds: z.number().int().positive(),
  question: questionSchema,
  serverTime: z.number().int().positive(),
  roundEndTime: z.number().int().positive(),
});

export const timerTickEventSchema = z.object({
  remainingSeconds: z.number().int().nonnegative(),
  totalSeconds: z.number().int().positive(),
  serverTime: z.number().int().positive(),
});

export const submitAnswerPayloadSchema = z.object({
  questionId: uuidSchema,
  answerIndex: z.number().int().min(0).max(3),
  submittedAt: z.number().int().positive(),
});

export const answerAcceptedEventSchema = z.object({
  questionId: uuidSchema,
  answerIndex: z.number().int().min(0).max(3),
  answeredAt: z.number().int().positive(),
});

export const answerProgressEventSchema = z.object({
  questionId: uuidSchema,
  answeredCount: z.number().int().nonnegative(),
  playerCount: z.number().int().nonnegative(),
  serverTime: z.number().int().positive(),
});

export const answerStatsSchema = z.object({
  optionIndex: z.number().int().min(0).max(3),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
});

export const scoreEntrySchema = z.object({
  playerId: uuidSchema,
  nickname: z.string(),
  avatarId: z.string(),
  score: z.number().int().nonnegative(),
  scoreDelta: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  answeredCorrectly: z.boolean(),
  selectedAnswerIndex: z.number().int().min(0).max(3).optional(),
});

export const roundEndEventSchema = z.object({
  questionId: uuidSchema,
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(800).optional(),
  revealMedia: mediaSchema.optional(),
  answerStats: z.array(answerStatsSchema).length(4),
  scores: z.array(scoreEntrySchema),
  reactionWindowSeconds: z.number().int().nonnegative(),
  nextRoundStartsAt: z.number().int().positive().optional(),
});

export const nextRoundCountdownEventSchema = z.object({
  remainingSeconds: z.number().int().nonnegative(),
  nextRoundStartsAt: z.number().int().positive(),
  serverTime: z.number().int().positive(),
});

export const leaderboardEntrySchema = z.object({
  playerId: uuidSchema,
  nickname: z.string(),
  avatarId: z.string(),
  score: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  correctAnswers: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  fastestAnswerMs: z.number().int().nonnegative().optional(),
});

export const personalStatsSchema = z.object({
  playerId: uuidSchema,
  correctAnswers: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  accuracyPercent: z.number().min(0).max(100),
  bestStreak: z.number().int().nonnegative(),
  fastestAnswerMs: z.number().int().nonnegative().optional(),
  finalScore: z.number().int().nonnegative(),
  finalRank: z.number().int().positive(),
});

export const gameEndEventSchema = z.object({
  leaderboard: z.array(leaderboardEntrySchema),
  personalStats: personalStatsSchema.optional(),
  canRestart: z.boolean(),
});

export const wsErrorEventSchema = z.object({
  code: z.nativeEnum(ErrorCode),
  message: z.string().min(1).max(240),
  details: z.unknown().optional(),
});

export const validationChecklistItemSchema = z.object({
  code: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  passed: z.boolean(),
  severity: z.enum(['INFO', 'WARNING', 'ERROR']).default('ERROR'),
});

export const quizDraftQuestionSchema = z.object({
  id: uuidSchema.optional(),
  quizId: uuidSchema.optional(),
  questionText: z.string().min(1).max(500),
  media: mediaSchema.optional(),
  revealMedia: mediaSchema.optional(),
  options: z.array(z.string().min(1).max(140)).length(4),
  order: z.number().int().nonnegative(),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(800).optional(),
});

export const quizDraftSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1).max(80),
  description: z.string().max(220).optional(),
  category: quizCategorySchema,
  difficulty: difficultySchema,
  status: z.nativeEnum(QuizStatus),
  coverUrl: mediaUrlSchema.optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  recommendedPlayersMin: z.number().int().positive().optional(),
  recommendedPlayersMax: z.number().int().positive().max(MAX_PLAYERS).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string().min(1).max(32)).default([]),
  questions: z.array(quizDraftQuestionSchema),
  validation: z.array(validationChecklistItemSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

export const saveQuizDraftRequestSchema = quizDraftSchema;

export const saveQuizDraftResponseSchema = z.object({
  quiz: quizDraftSchema,
  validation: z.array(validationChecklistItemSchema),
  savedAt: z.string().datetime(),
});

export const reorderQuestionsRequestSchema = z.object({
  quizId: uuidSchema,
  questionIds: z.array(uuidSchema).min(1),
});

export const mediaUploadResponseSchema = z.object({
  media: mediaSchema,
  id: uuidSchema,
  createdAt: z.string().datetime(),
});

export const userSummarySchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  displayName: z.string().min(1).max(80),
  role: z.nativeEnum(Role),
  avatarUrl: z.string().url().optional(),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(160),
});

export const authSessionSchema = z.object({
  accessToken: z.string().min(32),
  user: userSummarySchema,
});

export const qualityWarningSchema = z.object({
  code: z.nativeEnum(QualityWarningCode),
  label: z.string().min(1).max(120),
  description: z.string().max(240).optional(),
  count: z.number().int().nonnegative(),
});

export const dashboardStatsSchema = z.object({
  totalQuizzes: z.number().int().nonnegative(),
  pendingReview: z.number().int().nonnegative(),
  drafts: z.number().int().nonnegative(),
  approved: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
});

export const adminDashboardSchema = z.object({
  stats: dashboardStatsSchema,
  recentQuizzes: z.array(quizCardSchema),
  qualityWarnings: z.array(qualityWarningSchema),
  currentUser: userSummarySchema,
});

export const reviewQueueFiltersSchema = z.object({
  status: z.nativeEnum(QuizStatus).optional(),
  category: quizCategorySchema.optional(),
  difficulty: difficultySchema.optional(),
  authorId: uuidSchema.optional(),
  tags: z.array(z.string().min(1).max(32)).default([]),
  search: z.string().max(80).optional(),
  sort: z.nativeEnum(AdminSort).default(AdminSort.NEWEST),
});

export const adminQuizListFiltersSchema = z.object({
  status: z.nativeEnum(QuizStatus).optional(),
  category: quizCategorySchema.optional(),
  difficulty: difficultySchema.optional(),
  tags: z.array(z.string().min(1).max(32)).default([]),
  search: z.string().max(80).optional(),
  sort: z.nativeEnum(AdminSort).default(AdminSort.NEWEST),
});

export const adminQuizListSchema = z.object({
  items: z.array(quizCardSchema),
  filters: adminQuizListFiltersSchema,
  total: z.number().int().nonnegative(),
});

export const reviewDecisionPayloadSchema = z.object({
  quizId: uuidSchema,
  approve: z.boolean(),
  reasons: z.array(z.nativeEnum(ReviewRejectionReason)).default([]),
  comment: z.string().max(300).optional(),
});

export const reviewDecisionBodySchema = reviewDecisionPayloadSchema.omit({
  quizId: true,
});

export const reviewQueueItemSchema = quizCardSchema.extend({
  submittedAt: z.string().datetime(),
  author: userSummarySchema,
  validation: z.array(validationChecklistItemSchema),
});

export const reviewQueueSchema = z.object({
  items: z.array(reviewQueueItemSchema),
  selectedQuiz: reviewQueueItemSchema.optional(),
  filters: reviewQueueFiltersSchema,
  total: z.number().int().nonnegative(),
});

export function deriveRoomSettings(quizId: string, difficulty: Difficulty, mode: GameMode) {
  const modeSettings = GAME_MODE_SETTINGS[mode];

  return roomSettingsSchema.parse({
    quizId,
    difficulty,
    mode,
    questionDurationMs: modeSettings.questionDurationMs,
    revealDurationMs: modeSettings.revealDurationMs,
  });
}
