import type {
  AnswerWindowOpenEvent,
  AnswerProgressEvent,
  GameEndEvent,
  GamePausedEvent,
  GameStartingEvent,
  RoomClosedEvent,
  NextRoundCountdownEvent,
  ReactionWindowEvent,
  RoundEndEvent,
  RoundStartEvent,
  TimerTickEvent,
} from '@quizparty/shared';

export type TvGameConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

export type TvGameState =
  | { phase: 'waiting' }
  | { phase: 'starting'; event: GameStartingEvent }
  | {
      phase: 'question';
      pause?: GamePausedEvent;
      isPaused?: boolean;
      mediaLoadPending?: boolean;
      progress?: AnswerProgressEvent;
      answerWindow?: AnswerWindowOpenEvent;
      round: RoundStartEvent;
      timer: TimerTickEvent;
    }
  | {
      nextRound?: NextRoundCountdownEvent;
      phase: 'reveal';
      pause?: GamePausedEvent;
      isPaused?: boolean;
      reactionWindow?: ReactionWindowEvent;
      round?: RoundStartEvent;
      roundEnd: RoundEndEvent;
    }
  | { event: GameEndEvent; phase: 'final' };

export type TvRoomClosedState = {
  event: RoomClosedEvent;
  closed: true;
};
