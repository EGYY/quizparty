import type { GamePhase, LobbyState, Media, Question } from '@quizparty/shared';

export type StoredAnswer = {
  answerIndex: number;
  answeredAt: number;
  responseMs: number;
  isCorrect: boolean;
  scoreDelta: number;
};

export type PlayerGameStats = {
  correctAnswers: number;
  bestStreak: number;
  fastestAnswerMs?: number;
};

export type InternalGameQuestion = Question & {
  correctIndex: number;
  explanation?: string;
  revealMedia?: Media;
};

export type InternalGameState = {
  roomCode: string;
  quizId: string;
  phase: GamePhase;
  startedAt: number;
  currentRoundIndex: number;
  totalRounds: number;
  questions: InternalGameQuestion[];
  answers: Record<string, Record<string, StoredAnswer>>;
  playerStats: Record<string, PlayerGameStats>;
  roundStartedAt?: number;
  roundEndsAt?: number;
  revealEndsAt?: number;
  currentQuestion?: InternalGameQuestion;
  lastActivityAt: number;
};

export type RoomPatchResult = {
  state: LobbyState;
  hostTransfer?: {
    newHostId: string;
    newHostNickname: string;
  };
  shouldScheduleCleanup: boolean;
};
