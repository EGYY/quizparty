import { z } from 'zod';
import {
  adminDashboardSchema,
  adminQuizListFiltersSchema,
  adminQuizListSchema,
  authSessionSchema,
  answerAcceptedEventSchema,
  answerProgressEventSchema,
  answerStatsSchema,
  answerWindowOpenEventSchema,
  createRoomRequestSchema,
  createRoomResponseSchema,
  gameEndEventSchema,
  gamePausedEventSchema,
  gameResumedEventSchema,
  gameStartingEventSchema,
  hostTransferredEventSchema,
  joinLobbyPayloadSchema,
  leaderboardEntrySchema,
  loginRequestSchema,
  lobbyStateSchema,
  mediaSchema,
  personalStatsSchema,
  playerSchema,
  qualityWarningSchema,
  questionSchema,
  roundQuestionSchema,
  quizBrowserQuerySchema,
  quizCardSchema,
  quizDetailSchema,
  quizDraftQuestionSchema,
  quizDraftSchema,
  reactionWindowEventSchema,
  mediaUploadResponseSchema,
  nextRoundCountdownEventSchema,
  reorderQuestionsRequestSchema,
  reactionEventSchema,
  reactionPayloadSchema,
  registerRequestSchema,
  reviewDecisionPayloadSchema,
  reviewDecisionBodySchema,
  roomClosedEventSchema,
  reviewQueueFiltersSchema,
  reviewQueueItemSchema,
  reviewQueueSchema,
  roomSettingsSchema,
  roomSummarySchema,
  roundEndEventSchema,
  roundStartEventSchema,
  saveQuizDraftRequestSchema,
  saveQuizDraftResponseSchema,
  scoreEntrySchema,
  setPlayerInfoPayloadSchema,
  setReadyPayloadSchema,
  submitAnswerPayloadSchema,
  timerTickEventSchema,
  userSummarySchema,
  validationChecklistItemSchema,
  wsErrorEventSchema,
} from './schemas';

export type Media = z.infer<typeof mediaSchema>;
export type QuizCard = z.infer<typeof quizCardSchema>;
export type QuizDetail = z.infer<typeof quizDetailSchema>;
export type QuizBrowserQuery = z.infer<typeof quizBrowserQuerySchema>;
export type RoomSettings = z.infer<typeof roomSettingsSchema>;
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>;
export type RoomSummary = z.infer<typeof roomSummarySchema>;
export type Player = z.infer<typeof playerSchema>;
export type LobbyState = z.infer<typeof lobbyStateSchema>;
export type HostTransferredEvent = z.infer<typeof hostTransferredEventSchema>;
export type GameStartingEvent = z.infer<typeof gameStartingEventSchema>;
export type GamePausedEvent = z.infer<typeof gamePausedEventSchema>;
export type GameResumedEvent = z.infer<typeof gameResumedEventSchema>;
export type RoomClosedEvent = z.infer<typeof roomClosedEventSchema>;
export type JoinLobbyPayload = z.infer<typeof joinLobbyPayloadSchema>;
export type SetPlayerInfoPayload = z.infer<typeof setPlayerInfoPayloadSchema>;
export type SetReadyPayload = z.infer<typeof setReadyPayloadSchema>;
export type ReactionPayload = z.infer<typeof reactionPayloadSchema>;
export type ReactionEvent = z.infer<typeof reactionEventSchema>;
export type ReactionWindowEvent = z.infer<typeof reactionWindowEventSchema>;
export type Question = z.infer<typeof questionSchema>;
export type RoundQuestion = z.infer<typeof roundQuestionSchema>;
export type RoundStartEvent = z.infer<typeof roundStartEventSchema>;
export type TimerTickEvent = z.infer<typeof timerTickEventSchema>;
export type SubmitAnswerPayload = z.infer<typeof submitAnswerPayloadSchema>;
export type AnswerAcceptedEvent = z.infer<typeof answerAcceptedEventSchema>;
export type AnswerWindowOpenEvent = z.infer<typeof answerWindowOpenEventSchema>;
export type AnswerProgressEvent = z.infer<typeof answerProgressEventSchema>;
export type AnswerStats = z.infer<typeof answerStatsSchema>;
export type ScoreEntry = z.infer<typeof scoreEntrySchema>;
export type RoundEndEvent = z.infer<typeof roundEndEventSchema>;
export type NextRoundCountdownEvent = z.infer<typeof nextRoundCountdownEventSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type PersonalStats = z.infer<typeof personalStatsSchema>;
export type GameEndEvent = z.infer<typeof gameEndEventSchema>;
export type WsErrorEvent = z.infer<typeof wsErrorEventSchema>;
export type ValidationChecklistItem = z.infer<typeof validationChecklistItemSchema>;
export type QuizDraftQuestion = z.infer<typeof quizDraftQuestionSchema>;
export type QuizDraft = z.infer<typeof quizDraftSchema>;
export type SaveQuizDraftRequest = z.infer<typeof saveQuizDraftRequestSchema>;
export type SaveQuizDraftResponse = z.infer<typeof saveQuizDraftResponseSchema>;
export type ReorderQuestionsRequest = z.infer<typeof reorderQuestionsRequestSchema>;
export type MediaUploadResponse = z.infer<typeof mediaUploadResponseSchema>;
export type UserSummary = z.infer<typeof userSummarySchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type QualityWarning = z.infer<typeof qualityWarningSchema>;
export type AdminDashboard = z.infer<typeof adminDashboardSchema>;
export type AdminQuizListFilters = z.infer<typeof adminQuizListFiltersSchema>;
export type AdminQuizList = z.infer<typeof adminQuizListSchema>;
export type ReviewQueueFilters = z.infer<typeof reviewQueueFiltersSchema>;
export type ReviewDecisionPayload = z.infer<typeof reviewDecisionPayloadSchema>;
export type ReviewDecisionBody = z.infer<typeof reviewDecisionBodySchema>;
export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>;
export type ReviewQueue = z.infer<typeof reviewQueueSchema>;
