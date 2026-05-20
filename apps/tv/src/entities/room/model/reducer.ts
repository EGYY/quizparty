import type { LobbyState, ReactionEvent } from '@quizparty/shared';
import { prependRecentReaction } from '@shared/lib/reactions';
import type { TvQuiz, TvRoom } from '@shared/types/tv';
import { createInitialLobbyState } from './live-status';
import type { LobbyConnectionStatus, LobbyLiveStatus } from './types';

export type LobbyRealtimeState = {
  connectionStatus: LobbyConnectionStatus;
  error: string | null;
  liveStatus: LobbyLiveStatus;
  playerId: string | undefined;
  playerToken: string | undefined;
  recentReactions: ReactionEvent[];
  state: LobbyState;
};

export type LobbyRealtimeAction =
  | { type: 'connection/statusChanged'; status: LobbyConnectionStatus }
  | { type: 'connection/error'; message: string }
  | { type: 'error/set'; message: string }
  | { type: 'error/cleared' }
  | { type: 'lobby/invalidState' }
  | {
      type: 'lobby/stateReceived';
      playerId?: string;
      playerToken?: string;
      state: LobbyState;
    }
  | { type: 'live/statusChanged'; liveStatus: LobbyLiveStatus }
  | { type: 'reaction/received'; reaction: ReactionEvent };

export function createInitialLobbyRealtimeState(
  room: TvRoom,
  quiz: TvQuiz,
): LobbyRealtimeState {
  return {
    connectionStatus: 'connecting',
    error: null,
    liveStatus: {
      kind: 'idle',
      label: 'Ожидаем игроков',
    },
    playerId: undefined,
    playerToken: undefined,
    recentReactions: [],
    state: createInitialLobbyState(room, quiz),
  };
}

export function lobbyRealtimeReducer(
  state: LobbyRealtimeState,
  action: LobbyRealtimeAction,
): LobbyRealtimeState {
  switch (action.type) {
    case 'connection/statusChanged':
      return { ...state, connectionStatus: action.status };
    case 'connection/error':
      return {
        ...state,
        connectionStatus: 'error',
        error: action.message,
      };
    case 'error/set':
      return { ...state, error: action.message };
    case 'error/cleared':
      return { ...state, error: null };
    case 'lobby/invalidState':
      return {
        ...state,
        error: 'Backend прислал некорректное состояние лобби',
      };
    case 'lobby/stateReceived':
      return {
        ...state,
        error: null,
        playerId: action.playerId ?? state.playerId,
        playerToken: action.playerToken ?? state.playerToken,
        state: action.state,
      };
    case 'live/statusChanged':
      return { ...state, liveStatus: action.liveStatus };
    case 'reaction/received':
      return {
        ...state,
        recentReactions: prependRecentReaction(
          state.recentReactions,
          action.reaction,
        ),
      };
  }
}
