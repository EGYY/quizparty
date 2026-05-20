import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { LobbyState } from '@quizparty/shared';
import { createTvSocket } from '@shared/lib/socket';
import type { TvSocket } from '@shared/lib/socket';
import { dedupeLobbyStatePlayers } from '@shared/lib/lobby-state';
import { readLobbySocketError } from './model/live-status';
import {
  createInitialLobbyRealtimeState,
  lobbyRealtimeReducer,
} from './model/reducer';
import {
  attachRoomGameEvents,
  attachRoomLobbyLiveEvents,
} from './model/socket-events';
import type { UseLobbyRealtimeParams } from './model/types';

export function useLobbyRealtime({ quiz, room }: UseLobbyRealtimeParams) {
  const roomCode = room.roomCode;
  const [state, dispatch] = useReducer(
    lobbyRealtimeReducer,
    { room, quiz },
    ({ room: initialRoom, quiz: initialQuiz }) =>
      createInitialLobbyRealtimeState(initialRoom, initialQuiz),
  );
  const lobbySocketRef = useRef<TvSocket>(null);
  const gameSocketRef = useRef<TvSocket>(null);

  // Server-issued player-token (анти-спуфинг). На TV храним в памяти — сессия
  // живёт пока запущено приложение; на повторный JOIN_LOBBY токен пробрасываем.
  const playerIdRef = useRef<string | undefined>(undefined);
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

  // Обработчик личного LOBBY_STATE (содержит playerId + playerToken).
  // Используется как для lobby-, так и для game-сокета при первом JOIN_LOBBY.
  const applyPersonalLobbyState = useCallback((data: LobbyState) => {
    if (data.playerId) {
      playerIdRef.current = data.playerId;
    }
    if (data.playerToken) {
      playerTokenRef.current = data.playerToken;
    }
    dispatch({
      type: 'lobby/stateReceived',
      playerId: data.playerId,
      playerToken: data.playerToken,
      state: dedupeLobbyStatePlayers(data),
    });
  }, []);

  // Обработчик broadcast-событий (PLAYER_JOINED / PLAYER_LEFT / PLAYER_UPDATED).
  // Эти события рассылаются всей комнате и НЕ содержат playerId/playerToken,
  // поэтому не должны трогать refs — только обновляют состояние лобби.
  const applyBroadcastLobbyState = useCallback((data: LobbyState) => {
    dispatch({
      type: 'lobby/stateReceived',
      state: dedupeLobbyStatePlayers(data),
    });
  }, []);

  const attachGameEvents = useCallback(
    (socket: TvSocket) => {
      attachRoomGameEvents(socket, {
        onLobbyState: applyPersonalLobbyState,
        dispatch,
      });
    },
    [applyPersonalLobbyState],
  );

  const ensureGameSocket = useCallback(() => {
    if (!playerIdRef.current || gameSocketRef.current) return;

    const socket = createTvSocket('game');
    gameSocketRef.current = socket;
    attachGameEvents(socket);
    socket.onConnect(() => {
      socket.emit(ClientEvent.JOIN_LOBBY, joinPayload());
    });
    socket.onConnectError(event => {
      dispatch({
        type: 'error/set',
        message: `Game socket: ${event.message}`,
      });
    });
  }, [attachGameEvents, joinPayload]);

  useEffect(() => {
    dispatch({ type: 'connection/statusChanged', status: 'connecting' });
    const socket = createTvSocket('lobby');
    lobbySocketRef.current = socket;

    socket.onConnect(() => {
      dispatch({ type: 'connection/statusChanged', status: 'connected' });
      dispatch({ type: 'error/cleared' });
      socket.emit(ClientEvent.JOIN_LOBBY, joinPayload());
    });
    socket.onDisconnect(() => {
      dispatch({ type: 'connection/statusChanged', status: 'offline' });
    });
    socket.onConnectError(event => {
      dispatch({
        type: 'connection/error',
        message: `Lobby socket: ${event.message}`,
      });
    });
    socket.onReconnectAttempt(() => {
      dispatch({ type: 'connection/statusChanged', status: 'reconnecting' });
    });
    socket.onReconnect(() => {
      dispatch({ type: 'connection/statusChanged', status: 'connected' });
    });

    // Личный ответ сервера на JOIN_LOBBY — содержит playerId и playerToken.
    socket.on(ServerEvent.LOBBY_STATE, data => {
      applyPersonalLobbyState(data);
      ensureGameSocket();
    });
    // Broadcast-события о других игроках — playerId/playerToken отсутствуют.
    socket.on(ServerEvent.PLAYER_JOINED, applyBroadcastLobbyState);
    socket.on(ServerEvent.PLAYER_LEFT, applyBroadcastLobbyState);
    socket.on(ServerEvent.PLAYER_UPDATED, applyBroadcastLobbyState);
    socket.on(ServerEvent.REACTION_RECEIVED, data => {
      dispatch({ type: 'reaction/received', reaction: data });
    });
    socket.on(ServerEvent.ERROR, data => {
      dispatch({
        type: 'connection/error',
        message: readLobbySocketError(data, 'Ошибка websocket-соединения'),
      });
    });
    attachRoomLobbyLiveEvents(socket, dispatch);

    return () => {
      socket.disconnect();
      gameSocketRef.current?.disconnect();
      lobbySocketRef.current = null;
      gameSocketRef.current = null;
    };
  }, [
    applyBroadcastLobbyState,
    applyPersonalLobbyState,
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
    playerToken: state.playerToken,
    recentReactions: state.recentReactions,
    reconnect,
    startGame,
    state: state.state,
  };
}
