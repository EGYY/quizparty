import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  ClientEvent,
  ServerEvent,
  reactionEventSchema,
} from '@quizparty/shared';
import type { Socket } from 'socket.io-client';
import { createTvSocket } from '@shared/lib/socket';
import type { TvQuiz } from '@shared/types/tv';
import type { TvRoom } from './model';
import { parseLobbyEnvelope, readLobbySocketError } from './model/live-status';
import {
  createInitialLobbyRealtimeState,
  lobbyRealtimeReducer,
} from './model/reducer';
import {
  attachRoomGameEvents,
  attachRoomLobbyLiveEvents,
} from './model/socket-events';

type UseLobbyRealtimeParams = {
  quiz: TvQuiz;
  room: TvRoom;
};

export function useLobbyRealtime({ quiz, room }: UseLobbyRealtimeParams) {
  const roomCode = room.roomCode;
  const [state, dispatch] = useReducer(
    lobbyRealtimeReducer,
    { room, quiz },
    ({ room: initialRoom, quiz: initialQuiz }) =>
      createInitialLobbyRealtimeState(initialRoom, initialQuiz),
  );
  const lobbySocketRef = useRef<Socket | null>(null);
  const gameSocketRef = useRef<Socket | null>(null);
  const playerIdRef = useRef<string | undefined>(undefined);
  // Server-issued player-token (анти-спуфинг). На TV храним в памяти — сессия
  // живёт пока запущено приложение; на повторный JOIN_LOBBY токен пробрасываем.
  const playerTokenRef = useRef<string | undefined>(undefined);

  const joinPayload = useCallback(
    () => ({
      roomCode,
      nickname: 'TV ведущий',
      avatarId: 'popcorn-mascot',
      ...(playerIdRef.current ? { playerId: playerIdRef.current } : {}),
      ...(playerTokenRef.current
        ? { playerToken: playerTokenRef.current }
        : {}),
    }),
    [roomCode],
  );

  const applyLobbyState = useCallback((payload: unknown) => {
    const parsed = parseLobbyEnvelope(payload);
    if (!parsed) {
      dispatch({ type: 'lobby/invalidState' });
      return;
    }

    if (parsed.playerId) {
      playerIdRef.current = parsed.playerId;
    }
    if (parsed.playerToken) {
      playerTokenRef.current = parsed.playerToken;
    }

    dispatch({
      type: 'lobby/stateReceived',
      playerId: parsed.playerId,
      state: parsed.state,
    });
  }, []);

  const applyReaction = useCallback((payload: unknown) => {
    const parsed = reactionEventSchema.safeParse(payload);
    if (!parsed.success) return;
    dispatch({ type: 'reaction/received', reaction: parsed.data });
  }, []);

  const applyError = useCallback((payload: unknown) => {
    dispatch({
      type: 'connection/error',
      message: readLobbySocketError(payload, 'Ошибка websocket-соединения'),
    });
  }, []);

  const attachGameEvents = useCallback(
    (socket: Socket) => {
      attachRoomGameEvents(socket, {
        applyError,
        applyLobbyState,
        applyReaction,
        dispatch,
      });
    },
    [applyError, applyLobbyState, applyReaction],
  );

  const ensureGameSocket = useCallback(() => {
    if (!playerIdRef.current || gameSocketRef.current) return;

    const socket = createTvSocket('game');

    gameSocketRef.current = socket;
    attachGameEvents(socket);
    socket.on('connect', () => {
      socket.emit(ClientEvent.JOIN_LOBBY, joinPayload());
    });
    socket.on('connect_error', (event: Error) => {
      dispatch({
        type: 'error/set',
        message: `Game socket: ${event.message}`,
      });
    });
  }, [attachGameEvents, joinPayload]);

  useEffect(() => {
    dispatch({ type: 'connection/statusChanged', status: 'connecting' });
    const socket = createTvSocket('lobby');
    const manager = socket.io;
    lobbySocketRef.current = socket;

    const handleReconnectAttempt = () =>
      dispatch({ type: 'connection/statusChanged', status: 'reconnecting' });
    const handleReconnect = () =>
      dispatch({ type: 'connection/statusChanged', status: 'connected' });

    socket.on('connect', () => {
      dispatch({ type: 'connection/statusChanged', status: 'connected' });
      dispatch({ type: 'error/cleared' });
      socket.emit(ClientEvent.JOIN_LOBBY, joinPayload());
    });
    socket.on('disconnect', () =>
      dispatch({ type: 'connection/statusChanged', status: 'offline' }),
    );
    socket.on('connect_error', (event: Error) => {
      dispatch({
        type: 'connection/error',
        message: `Lobby socket: ${event.message}`,
      });
    });
    manager.on('reconnect_attempt', handleReconnectAttempt);
    manager.on('reconnect', handleReconnect);

    socket.on(ServerEvent.LOBBY_STATE, (payload: unknown) => {
      applyLobbyState(payload);
      ensureGameSocket();
    });
    socket.on(ServerEvent.PLAYER_JOINED, applyLobbyState);
    socket.on(ServerEvent.PLAYER_LEFT, applyLobbyState);
    socket.on(ServerEvent.PLAYER_UPDATED, applyLobbyState);
    socket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
    socket.on(ServerEvent.ERROR, applyError);
    attachRoomLobbyLiveEvents(socket, dispatch);

    return () => {
      manager.off('reconnect_attempt', handleReconnectAttempt);
      manager.off('reconnect', handleReconnect);
      socket.disconnect();
      gameSocketRef.current?.disconnect();
      lobbySocketRef.current = null;
      gameSocketRef.current = null;
    };
  }, [
    applyError,
    applyLobbyState,
    applyReaction,
    ensureGameSocket,
    joinPayload,
  ]);

  const startGame = useCallback(() => {
    const socket = lobbySocketRef.current;
    if (!socket?.connected) {
      dispatch({
        type: 'error/set',
        message: 'Нет соединения с lobby socket. Переподключаемся...',
      });
      socket?.connect();
      return;
    }
    dispatch({
      type: 'live/statusChanged',
      liveStatus: {
        kind: 'starting',
        label: 'Запускаем игру',
        remainingSeconds: 3,
      },
    });
    socket.emit(ClientEvent.START_GAME);
  }, []);

  const hideQr = useCallback(() => {
    const socket = lobbySocketRef.current;
    if (!socket?.connected) {
      dispatch({
        type: 'error/set',
        message: 'Нельзя скрыть QR без соединения с backend',
      });
      return;
    }
    socket.emit(ClientEvent.HIDE_QR);
  }, []);

  const reconnect = useCallback(() => {
    dispatch({ type: 'connection/statusChanged', status: 'reconnecting' });
    lobbySocketRef.current?.connect();
    gameSocketRef.current?.connect();
  }, []);

  return {
    connectionStatus: state.connectionStatus,
    error: state.error,
    hideQr,
    liveStatus: state.liveStatus,
    playerId: state.playerId,
    recentReactions: state.recentReactions,
    reconnect,
    startGame,
    state: state.state,
  };
}
