import type {
  AnswerAcceptedEvent,
  GameEndEvent,
  GamePausedEvent,
  GameStartingEvent,
  NextRoundCountdownEvent,
  ReactionWindowEvent,
  RoomSummary,
  RoundEndEvent,
  RoundStartEvent,
  TimerTickEvent,
} from '@quizparty/shared';

export type PhoneConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

export type PhoneGameState =
  | { phase: 'lobby' }
  | { event: GameStartingEvent; phase: 'starting' }
  | {
      accepted?: AnswerAcceptedEvent;
      isPaused?: boolean;
      pause?: GamePausedEvent | undefined;
      phase: 'question';
      round: RoundStartEvent;
      selectedAnswerIndex?: number;
      timer: TimerTickEvent;
    }
  | {
      nextRound?: NextRoundCountdownEvent;
      isPaused?: boolean;
      pause?: GamePausedEvent | undefined;
      phase: 'reveal';
      reactionWindow?: ReactionWindowEvent;
      round?: RoundStartEvent;
      roundEnd: RoundEndEvent;
    }
  | { event: GameEndEvent; phase: 'final' };

export type UsePhoneGameParams = {
  avatarId: string;
  nickname: string;
  playerId: string;
  room: RoomSummary;
};
