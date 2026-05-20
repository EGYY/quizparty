import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { RoundStartEvent } from '@quizparty/shared';
import { dedupeLobbyStatePlayers } from '@shared/lib/lobby-state';
import { createTvSocket } from '@shared/lib/socket';
import type { TvSocket } from '@shared/lib/socket';
import type { TvRoom } from '@shared/types/tv';
import { makeTvGameJoinPayload } from './model/event-mappers';
import {
  initialTvGameRealtimeState,
  tvGameRealtimeReducer,
} from './model/reducer';
import { attachTvGameEvents } from './model/socket-events';

type UseTvGameRealtimeParams = {
  playerId: string;
  playerToken?: string;
  room: TvRoom;
};

export function useTvGameRealtime({
  playerId,
  playerToken,
  room,
}: UseTvGameRealtimeParams) {
  const [state, dispatch] = useReducer(
    tvGameRealtimeReducer,
    initialTvGameRealtimeState,
  );
  const gameSocketRef = useRef<TvSocket>(null);
  const lobbySocketRef = useRef<TvSocket>(null);
  const currentRoundRef = useRef<RoundStartEvent | undefined>(undefined);

  const joinPayload = useMemo(
    () => makeTvGameJoinPayload(room, playerId, playerToken),
    [playerId, playerToken, room],
  );

  const attachGameEvents = useCallback((socket: TvSocket) => {
    attachTvGameEvents(socket, { currentRoundRef, dispatch });
  }, []);

  useEffect(() => {
    const gameSocket = createTvSocket('game');
    const lobbySocket = createTvSocket('lobby');
    gameSocketRef.current = gameSocket;
    lobbySocketRef.current = lobbySocket;

    attachGameEvents(gameSocket);

    lobbySocket.on(ServerEvent.LOBBY_STATE, data => {
      dispatch({
        type: 'lobby/stateReceived',
        state: dedupeLobbyStatePlayers(data),
      });
    });
    lobbySocket.on(ServerEvent.ERROR, data => {
      dispatch({ type: 'connection/error', message: data.message });
    });

    gameSocket.onConnect(() => {
      dispatch({ type: 'connection/statusChanged', status: 'connected' });
      dispatch({ type: 'connection/errorCleared' });
      gameSocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    lobbySocket.onConnect(() => {
      lobbySocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    gameSocket.onDisconnect(() => {
      dispatch({ type: 'connection/statusChanged', status: 'offline' });
    });
    gameSocket.onConnectError(event => {
      dispatch({
        type: 'connection/error',
        message: `Game socket: ${event.message}`,
      });
    });
    gameSocket.onReconnectAttempt(() => {
      dispatch({ type: 'connection/statusChanged', status: 'reconnecting' });
    });
    gameSocket.onReconnect(() => {
      dispatch({ type: 'connection/statusChanged', status: 'connected' });
    });

    return () => {
      gameSocket.disconnect();
      lobbySocket.disconnect();
      gameSocketRef.current = null;
      lobbySocketRef.current = null;
    };
  }, [attachGameEvents, joinPayload]);

  const reconnect = useCallback(() => {
    dispatch({ type: 'connection/statusChanged', status: 'reconnecting' });
    gameSocketRef.current?.connect();
    lobbySocketRef.current?.connect();
  }, []);

  const playAgain = useCallback(() => {
    const socket = lobbySocketRef.current;
    if (!socket?.connected) {
      dispatch({
        type: 'connection/error',
        message: 'Нет соединения с lobby socket для перезапуска',
      });
      socket?.connect();
      return;
    }
    socket.emit(ClientEvent.START_GAME);
  }, []);

  return {
    connectionStatus: state.connectionStatus,
    error: state.error,
    gameState: state.gameState,
    lobbyState: state.lobbyState,
    playAgain,
    recentReactions: state.recentReactions,
    reconnect,
  };
}
