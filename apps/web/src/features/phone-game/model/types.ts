import type {
  AnswerAcceptedEvent,
  GameEndEvent,
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
      phase: 'question';
      round: RoundStartEvent;
      selectedAnswerIndex?: number;
      timer: TimerTickEvent;
    }
  | {
      nextRound?: NextRoundCountdownEvent;
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
