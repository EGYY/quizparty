import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ClientEvent,
  GamePhase,
  MAX_PLAYERS,
  ServerEvent,
  gameEndEventSchema,
  gameStartingEventSchema,
  lobbyStateSchema,
  nextRoundCountdownEventSchema,
  reactionEventSchema,
  reactionWindowEventSchema,
  roundEndEventSchema,
  roundStartEventSchema,
  timerTickEventSchema,
  wsErrorEventSchema,
} from '@quizparty/shared';
import type {
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
import { io, type Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '@shared/config/env';
import type { TvQuiz } from '@entities/quiz';
import { dedupeLobbyStatePlayers, type TvRoom } from './model';

type LobbyEnvelope = LobbyState & { playerId?: string };

export type LobbyConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

export type LobbyLiveStatus =
  | { kind: 'idle'; label: string }
  | { kind: 'starting'; label: string; remainingSeconds: number }
  | {
      kind: 'question';
      label: string;
      remainingSeconds: number;
      totalSeconds: number;
    }
  | { kind: 'reveal'; label: string; remainingSeconds: number }
  | { kind: 'finished'; label: string };

type UseLobbyRealtimeParams = {
  quiz: TvQuiz;
  room: TvRoom;
};

function createInitialState(room: TvRoom, quiz: TvQuiz): LobbyState {
  return {
    roomCode: room.roomCode,
    joinUrl: room.joinUrl,
    qrVisible: true,
    phase: GamePhase.LOBBY,
    selectedQuiz: quiz,
    settings: room.settings,
    players: [],
    maxPlayers: MAX_PLAYERS,
  };
}

function readSocketError(payload: unknown, fallback: string): string {
  const parsed = wsErrorEventSchema.safeParse(payload);
  if (parsed.success) return parsed.data.message;
  if (payload instanceof Error) return payload.message;
  return fallback;
}

function parseLobbyEnvelope(
  payload: unknown,
): { state: LobbyState; playerId?: string } | null {
  const envelope = payload as Partial<LobbyEnvelope>;
  const parsed = lobbyStateSchema.safeParse(payload);
  if (!parsed.success) return null;
  return {
    state: dedupeLobbyStatePlayers(parsed.data),
    ...(typeof envelope.playerId === 'string'
      ? { playerId: envelope.playerId }
      : {}),
  };
}

function buildStartingLive(event: GameStartingEvent): LobbyLiveStatus {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((event.startsAt - Date.now()) / 1000),
  );
  return {
    kind: 'starting',
    label: 'Игра стартует',
    remainingSeconds,
  };
}

function buildQuestionLive(event: RoundStartEvent): LobbyLiveStatus {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((event.roundEndTime - Date.now()) / 1000),
  );
  return {
    kind: 'question',
    label: `${event.roundNumber} / ${event.totalRounds}`,
    remainingSeconds,
    totalSeconds: Math.max(
      1,
      Math.ceil((event.roundEndTime - event.serverTime) / 1000),
    ),
  };
}

function buildRevealLive(
  event: RoundEndEvent | ReactionWindowEvent | NextRoundCountdownEvent,
): LobbyLiveStatus {
  const target =
    'nextRoundStartsAt' in event
      ? event.nextRoundStartsAt
      : 'closesAt' in event
        ? event.closesAt
        : event.nextRoundStartsAt;
  return {
    kind: 'reveal',
    label: 'Показываем ответ',
    remainingSeconds: target
      ? Math.max(0, Math.ceil((target - Date.now()) / 1000))
      : 0,
  };
}

export function useLobbyRealtime({ quiz, room }: UseLobbyRealtimeParams) {
  const roomCode = room.roomCode;
  const [state, setState] = useState<LobbyState>(() =>
    createInitialState(room, quiz),
  );
  const [connectionStatus, setConnectionStatus] =
    useState<LobbyConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);
  const [liveStatus, setLiveStatus] = useState<LobbyLiveStatus>({
    kind: 'idle',
    label: 'Ожидаем игроков',
  });
  const lobbySocketRef = useRef<Socket | null>(null);
  const gameSocketRef = useRef<Socket | null>(null);
  const playerIdRef = useRef<string | undefined>(undefined);
  const [playerId, setPlayerId] = useState<string | undefined>(undefined);

  const joinPayload = useCallback(
    () => ({
      roomCode,
      nickname: 'TV ведущий',
      avatarId: 'popcorn-mascot',
      ...(playerIdRef.current ? { playerId: playerIdRef.current } : {}),
    }),
    [roomCode],
  );

  const applyLobbyState = useCallback((payload: unknown) => {
    const parsed = parseLobbyEnvelope(payload);
    if (!parsed) {
      setError('Backend прислал некорректное состояние лобби');
      return;
    }

    if (parsed.playerId) {
      playerIdRef.current = parsed.playerId;
      setPlayerId(parsed.playerId);
    }

    setState(parsed.state);
    setError(null);
  }, []);

  const applyReaction = useCallback((payload: unknown) => {
    const parsed = reactionEventSchema.safeParse(payload);
    if (!parsed.success) return;
    setRecentReactions(current =>
      [parsed.data, ...current.filter(r => r.id !== parsed.data.id)].slice(
        0,
        8,
      ),
    );
  }, []);

  const applyError = useCallback((payload: unknown) => {
    setConnectionStatus('error');
    setError(readSocketError(payload, 'Ошибка websocket-соединения'));
  }, []);

  const attachGameEvents = useCallback(
    (socket: Socket) => {
      socket.on(ServerEvent.LOBBY_STATE, applyLobbyState);
      socket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
      socket.on(ServerEvent.ERROR, applyError);
      socket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
        const parsed = gameStartingEventSchema.safeParse(payload);
        if (parsed.success) setLiveStatus(buildStartingLive(parsed.data));
      });
      socket.on(ServerEvent.ROUND_START, (payload: unknown) => {
        const parsed = roundStartEventSchema.safeParse(payload);
        if (parsed.success) setLiveStatus(buildQuestionLive(parsed.data));
      });
      socket.on(ServerEvent.TIMER_TICK, (payload: unknown) => {
        const parsed = timerTickEventSchema.safeParse(payload);
        if (parsed.success) {
          const event: TimerTickEvent = parsed.data;
          setLiveStatus({
            kind: 'question',
            label: 'Текущий вопрос',
            remainingSeconds: event.remainingSeconds,
            totalSeconds: event.totalSeconds,
          });
        }
      });
      socket.on(ServerEvent.ROUND_END, (payload: unknown) => {
        const parsed = roundEndEventSchema.safeParse(payload);
        if (parsed.success) setLiveStatus(buildRevealLive(parsed.data));
      });
      socket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
        const parsed = reactionWindowEventSchema.safeParse(payload);
        if (parsed.success) setLiveStatus(buildRevealLive(parsed.data));
      });
      socket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, (payload: unknown) => {
        const parsed = nextRoundCountdownEventSchema.safeParse(payload);
        if (parsed.success) setLiveStatus(buildRevealLive(parsed.data));
      });
      socket.on(ServerEvent.GAME_END, (payload: unknown) => {
        const parsed = gameEndEventSchema.safeParse(payload);
        const event: GameEndEvent | undefined = parsed.success
          ? parsed.data
          : undefined;
        setLiveStatus({
          kind: 'finished',
          label: event?.leaderboard.length ? 'Игра завершена' : 'Финал',
        });
      });
    },
    [applyError, applyLobbyState, applyReaction],
  );

  const ensureGameSocket = useCallback(() => {
    if (!playerIdRef.current || gameSocketRef.current) return;

    const socket = io(`${SOCKET_BASE_URL}/game`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });

    gameSocketRef.current = socket;
    attachGameEvents(socket);
    socket.on('connect', () => {
      socket.emit(ClientEvent.JOIN_LOBBY, joinPayload());
    });
    socket.on('connect_error', (event: Error) => {
      setError(`Game socket: ${event.message}`);
    });
  }, [attachGameEvents, joinPayload]);

  useEffect(() => {
    setConnectionStatus('connecting');
    const socket = io(`${SOCKET_BASE_URL}/lobby`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });
    const manager = socket.io;
    lobbySocketRef.current = socket;

    const handleReconnectAttempt = () => setConnectionStatus('reconnecting');
    const handleReconnect = () => setConnectionStatus('connected');

    socket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);
      socket.emit(ClientEvent.JOIN_LOBBY, joinPayload());
    });
    socket.on('disconnect', () => setConnectionStatus('offline'));
    socket.on('connect_error', (event: Error) => {
      setConnectionStatus('error');
      setError(`Lobby socket: ${event.message}`);
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
    socket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
      const parsed = gameStartingEventSchema.safeParse(payload);
      if (parsed.success) setLiveStatus(buildStartingLive(parsed.data));
    });
    socket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
      const parsed = reactionWindowEventSchema.safeParse(payload);
      if (parsed.success) setLiveStatus(buildRevealLive(parsed.data));
    });
    socket.on(ServerEvent.GAME_END, () =>
      setLiveStatus({ kind: 'finished', label: 'Игра завершена' }),
    );

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
      setError('Нет соединения с lobby socket. Переподключаемся...');
      socket?.connect();
      return;
    }
    setLiveStatus({
      kind: 'starting',
      label: 'Запускаем игру',
      remainingSeconds: 3,
    });
    socket.emit(ClientEvent.START_GAME);
  }, []);

  const hideQr = useCallback(() => {
    const socket = lobbySocketRef.current;
    if (!socket?.connected) {
      setError('Нельзя скрыть QR без соединения с backend');
      return;
    }
    socket.emit(ClientEvent.HIDE_QR);
  }, []);

  const reconnect = useCallback(() => {
    setConnectionStatus('reconnecting');
    lobbySocketRef.current?.connect();
    gameSocketRef.current?.connect();
  }, []);

  return {
    connectionStatus,
    error,
    hideQr,
    liveStatus,
    playerId,
    recentReactions,
    reconnect,
    startGame,
    state,
  };
}
