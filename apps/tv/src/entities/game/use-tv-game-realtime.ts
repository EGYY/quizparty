import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  ClientEvent,
  ServerEvent,
  lobbyStateSchema,
  reactionEventSchema,
} from '@quizparty/shared';
import type { RoundStartEvent } from '@quizparty/shared';
import type { Socket } from 'socket.io-client';
import { dedupeLobbyStatePlayers } from '@shared/lib/lobby-state';
import { createTvSocket } from '@shared/lib/socket';
import type { TvRoom } from '@shared/types/tv';
import {
  makeTvGameJoinPayload,
  readGameSocketError,
} from './model/event-mappers';
import {
  initialTvGameRealtimeState,
  tvGameRealtimeReducer,
} from './model/reducer';
import { attachTvGameEvents } from './model/socket-events';

type UseTvGameRealtimeParams = {
  playerId: string;
  room: TvRoom;
};

export function useTvGameRealtime({ playerId, room }: UseTvGameRealtimeParams) {
  const [state, dispatch] = useReducer(
    tvGameRealtimeReducer,
    initialTvGameRealtimeState,
  );
  const gameSocketRef = useRef<Socket | null>(null);
  const lobbySocketRef = useRef<Socket | null>(null);
  const currentRoundRef = useRef<RoundStartEvent | undefined>(undefined);

  const joinPayload = useMemo(
    () => makeTvGameJoinPayload(room, playerId),
    [playerId, room],
  );

  const applyLobbyState = useCallback((payload: unknown) => {
    const parsed = lobbyStateSchema.safeParse(payload);
    if (!parsed.success) return;
    dispatch({
      type: 'lobby/stateReceived',
      state: dedupeLobbyStatePlayers(parsed.data),
    });
  }, []);

  const applyReaction = useCallback((payload: unknown) => {
    const parsed = reactionEventSchema.safeParse(payload);
    if (!parsed.success) return;
    dispatch({ type: 'reaction/received', reaction: parsed.data });
  }, []);

  const attachGameEvents = useCallback(
    (socket: Socket) => {
      attachTvGameEvents(socket, {
        applyLobbyState,
        applyReaction,
        currentRoundRef,
        dispatch,
      });
    },
    [applyLobbyState, applyReaction],
  );

  useEffect(() => {
    const gameSocket = createTvSocket('game');
    const lobbySocket = createTvSocket('lobby');
    gameSocketRef.current = gameSocket;
    lobbySocketRef.current = lobbySocket;
    const gameManager = gameSocket.io;
    const handleReconnectAttempt = () =>
      dispatch({ type: 'connection/statusChanged', status: 'reconnecting' });
    const handleReconnect = () =>
      dispatch({ type: 'connection/statusChanged', status: 'connected' });

    attachGameEvents(gameSocket);
    lobbySocket.on(ServerEvent.ERROR, (payload: unknown) =>
      dispatch({
        type: 'connection/error',
        message: readGameSocketError(payload),
      }),
    );

    gameSocket.on('connect', () => {
      dispatch({ type: 'connection/statusChanged', status: 'connected' });
      dispatch({ type: 'connection/errorCleared' });
      gameSocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    lobbySocket.on('connect', () => {
      lobbySocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    gameSocket.on('disconnect', () =>
      dispatch({ type: 'connection/statusChanged', status: 'offline' }),
    );
    gameSocket.on('connect_error', (event: Error) => {
      dispatch({
        type: 'connection/error',
        message: `Game socket: ${event.message}`,
      });
    });
    gameManager.on('reconnect_attempt', handleReconnectAttempt);
    gameManager.on('reconnect', handleReconnect);

    return () => {
      gameManager.off('reconnect_attempt', handleReconnectAttempt);
      gameManager.off('reconnect', handleReconnect);
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
