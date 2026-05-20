import type {
  AnswerProgressEvent,
  GameEndEvent,
  GameStartingEvent,
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
      progress?: AnswerProgressEvent;
      round: RoundStartEvent;
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
