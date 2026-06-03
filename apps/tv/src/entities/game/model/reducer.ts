import type {
  AnswerWindowOpenEvent,
  AnswerProgressEvent,
  GameEndEvent,
  GamePausedEvent,
  GameResumedEvent,
  GameStartingEvent,
  LobbyState,
  NextRoundCountdownEvent,
  ReactionEvent,
  ReactionWindowEvent,
  RoomClosedEvent,
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
  roomClosed: RoomClosedEvent | undefined;
};

export type TvGameRealtimeAction =
  | { type: 'connection/statusChanged'; status: TvGameConnectionStatus }
  | { type: 'connection/error'; message: string }
  | { type: 'connection/errorCleared' }
  | { type: 'lobby/stateReceived'; state: LobbyState }
  | { type: 'reaction/received'; reaction: ReactionEvent }
  | { type: 'game/starting'; event: GameStartingEvent }
  | { type: 'game/roundStarted'; round: RoundStartEvent }
  | { type: 'game/answerWindowOpened'; event: AnswerWindowOpenEvent }
  | { type: 'game/timerTicked'; timer: TimerTickEvent }
  | { type: 'game/answerProgressed'; progress: AnswerProgressEvent }
  | {
      type: 'game/roundEnded';
      round: RoundStartEvent | undefined;
      roundEnd: RoundEndEvent;
    }
  | { type: 'game/reactionWindowOpened'; reactionWindow: ReactionWindowEvent }
  | { type: 'game/nextRoundCountdown'; nextRound: NextRoundCountdownEvent }
  | { type: 'game/ended'; event: GameEndEvent }
  | { type: 'game/paused'; event: GamePausedEvent }
  | { type: 'game/resumed'; event: GameResumedEvent }
  | { type: 'game/roomClosed'; event: RoomClosedEvent };

export const initialTvGameRealtimeState: TvGameRealtimeState = {
  connectionStatus: 'connecting',
  error: null,
  gameState: { phase: 'waiting' },
  lobbyState: undefined,
  recentReactions: [],
  roomClosed: undefined,
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
          mediaLoadPending: action.round.mediaLoadPending ?? false,
        },
      };
    case 'game/timerTicked':
      if (state.gameState.phase !== 'question') return state;
      if (state.gameState.isPaused) return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          timer: action.timer,
          mediaLoadPending: false,
        },
      };
    case 'game/answerWindowOpened':
      if (state.gameState.phase !== 'question') return state;
      if (state.gameState.round.question.id !== action.event.questionId)
        return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          answerWindow: action.event,
          round: {
            ...state.gameState.round,
            question: {
              ...state.gameState.round.question,
              options: action.event.options,
            },
            answerStartTime: action.event.answerStartTime,
            roundEndTime: action.event.roundEndTime,
          },
          timer: {
            remainingSeconds: Math.max(
              0,
              Math.ceil(
                (action.event.roundEndTime - action.event.serverTime) / 1000,
              ),
            ),
            totalSeconds: Math.max(
              1,
              Math.ceil(
                (action.event.roundEndTime - action.event.answerStartTime) /
                  1000,
              ),
            ),
            serverTime: action.event.serverTime,
            stage: 'answering',
          },
        },
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
      if (state.gameState.isPaused) return state;
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
    case 'game/paused':
      if (
        state.gameState.phase !== 'question' &&
        state.gameState.phase !== 'reveal'
      ) {
        return state;
      }
      return {
        ...state,
        gameState: {
          ...state.gameState,
          isPaused: true,
          pause: action.event,
        },
      };
    case 'game/resumed':
      if (state.gameState.phase === 'question') {
        return {
          ...state,
          gameState: {
            ...state.gameState,
            isPaused: false,
            pause: undefined,
            timer: {
              ...state.gameState.timer,
              remainingSeconds: Math.ceil(action.event.remainingMs / 1000),
              serverTime: action.event.serverTime,
            },
          },
        };
      }
      if (state.gameState.phase === 'reveal') {
        return {
          ...state,
          gameState: {
            ...state.gameState,
            isPaused: false,
            pause: undefined,
            ...(state.gameState.nextRound
              ? {
                  nextRound: {
                    ...state.gameState.nextRound,
                    nextRoundStartsAt: action.event.targetTime,
                    remainingSeconds: Math.ceil(
                      action.event.remainingMs / 1000,
                    ),
                    serverTime: action.event.serverTime,
                  },
                }
              : {}),
            ...(state.gameState.reactionWindow
              ? {
                  reactionWindow: {
                    ...state.gameState.reactionWindow,
                    closesAt: action.event.targetTime,
                    serverTime: action.event.serverTime,
                  },
                }
              : {}),
          },
        };
      }
      return state;
    case 'game/roomClosed':
      return {
        ...state,
        roomClosed: action.event,
      };
  }
}
