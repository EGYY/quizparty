import type {
  AnswerProgressEvent,
  GameEndEvent,
  GameStartingEvent,
  LobbyState,
  NextRoundCountdownEvent,
  ReactionEvent,
  ReactionWindowEvent,
  RoundEndEvent,
  RoundStartEvent,
  TimerTickEvent,
} from '@quizparty/shared';
import { prependRecentReaction } from '@shared/lib/reactions';
import { buildInitialTimer } from './event-mappers';
import type { TvGameConnectionStatus, TvGameState } from './types';

export type TvGameRealtimeState = {
  connectionStatus: TvGameConnectionStatus;
  error: string | null;
  gameState: TvGameState;
  lobbyState: LobbyState | undefined;
  recentReactions: ReactionEvent[];
};

export type TvGameRealtimeAction =
  | { type: 'connection/statusChanged'; status: TvGameConnectionStatus }
  | { type: 'connection/error'; message: string }
  | { type: 'connection/errorCleared' }
  | { type: 'lobby/stateReceived'; state: LobbyState }
  | { type: 'reaction/received'; reaction: ReactionEvent }
  | { type: 'game/starting'; event: GameStartingEvent }
  | { type: 'game/roundStarted'; round: RoundStartEvent }
  | { type: 'game/timerTicked'; timer: TimerTickEvent }
  | { type: 'game/answerProgressed'; progress: AnswerProgressEvent }
  | {
      type: 'game/roundEnded';
      round: RoundStartEvent | undefined;
      roundEnd: RoundEndEvent;
    }
  | { type: 'game/reactionWindowOpened'; reactionWindow: ReactionWindowEvent }
  | { type: 'game/nextRoundCountdown'; nextRound: NextRoundCountdownEvent }
  | { type: 'game/ended'; event: GameEndEvent };

export const initialTvGameRealtimeState: TvGameRealtimeState = {
  connectionStatus: 'connecting',
  error: null,
  gameState: { phase: 'waiting' },
  lobbyState: undefined,
  recentReactions: [],
};

export function tvGameRealtimeReducer(
  state: TvGameRealtimeState,
  action: TvGameRealtimeAction,
): TvGameRealtimeState {
  switch (action.type) {
    case 'connection/statusChanged':
      return { ...state, connectionStatus: action.status };
    case 'connection/error':
      return {
        ...state,
        connectionStatus: 'error',
        error: action.message,
      };
    case 'connection/errorCleared':
      return { ...state, error: null };
    case 'lobby/stateReceived':
      return { ...state, lobbyState: action.state };
    case 'reaction/received':
      return {
        ...state,
        recentReactions: prependRecentReaction(
          state.recentReactions,
          action.reaction,
        ),
      };
    case 'game/starting':
      return {
        ...state,
        gameState: { phase: 'starting', event: action.event },
      };
    case 'game/roundStarted':
      return {
        ...state,
        gameState: {
          phase: 'question',
          round: action.round,
          timer: buildInitialTimer(action.round),
        },
      };
    case 'game/timerTicked':
      if (state.gameState.phase !== 'question') return state;
      return {
        ...state,
        gameState: { ...state.gameState, timer: action.timer },
      };
    case 'game/answerProgressed':
      if (state.gameState.phase !== 'question') return state;
      return {
        ...state,
        gameState: { ...state.gameState, progress: action.progress },
      };
    case 'game/roundEnded':
      return {
        ...state,
        gameState: {
          phase: 'reveal',
          round: action.round,
          roundEnd: action.roundEnd,
        },
      };
    case 'game/reactionWindowOpened':
      if (state.gameState.phase !== 'reveal') return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          reactionWindow: action.reactionWindow,
        },
      };
    case 'game/nextRoundCountdown':
      if (state.gameState.phase !== 'reveal') return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          nextRound: action.nextRound,
        },
      };
    case 'game/ended':
      return {
        ...state,
        gameState: { phase: 'final', event: action.event },
      };
  }
}
