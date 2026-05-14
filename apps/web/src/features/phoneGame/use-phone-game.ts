import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ClientEvent,
  ServerEvent,
  answerAcceptedEventSchema,
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
  AnswerAcceptedEvent,
  GameEndEvent,
  GameStartingEvent,
  LobbyState,
  NextRoundCountdownEvent,
  ReactionEvent,
  ReactionWindowEvent,
  RoomSummary,
  RoundEndEvent,
  RoundStartEvent,
  TimerTickEvent,
} from '@quizparty/shared';
import { io, type Socket } from 'socket.io-client';

export type PhoneConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

export type PhoneGameState =
  | { phase: 'lobby' }
  | { event: GameStartingEvent; phase: 'starting' }
  | {
      accepted?: AnswerAcceptedEvent;
      phase: 'question';
      round: RoundStartEvent;
      selectedAnswerIndex?: number;
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

type UsePhoneGameParams = {
  avatarId: string;
  nickname: string;
  playerId: string;
  room: RoomSummary;
};

const socketOrigin = window.location.origin.replace(/:\d+$/, ':3001');
const socketBaseUrl = import.meta.env.VITE_SOCKET_BASE_URL ?? socketOrigin;

function readError(payload: unknown): string {
  const parsed = wsErrorEventSchema.safeParse(payload);
  if (parsed.success) return parsed.data.message;
  if (payload instanceof Error) return payload.message;
  return 'Ошибка realtime-соединения';
}

function buildInitialTimer(round: RoundStartEvent): TimerTickEvent {
  return {
    remainingSeconds: Math.max(0, Math.ceil((round.roundEndTime - Date.now()) / 1000)),
    totalSeconds: Math.max(1, Math.ceil((round.roundEndTime - round.serverTime) / 1000)),
    serverTime: Date.now(),
  };
}

export function usePhoneGame({ avatarId, nickname, playerId, room }: UsePhoneGameParams) {
  const [connectionStatus, setConnectionStatus] = useState<PhoneConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyState>();
  const [gameState, setGameState] = useState<PhoneGameState>({ phase: 'lobby' });
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);
  const lobbySocketRef = useRef<Socket | null>(null);
  const gameSocketRef = useRef<Socket | null>(null);
  const currentRoundRef = useRef<RoundStartEvent | undefined>(undefined);
  const lobbyJoinedRef = useRef(false);
  const gameJoinedRef = useRef(false);
  const pendingProfileRef = useRef<{ avatarId: string; nickname: string } | undefined>(undefined);

  const joinPayload = useMemo(
    () => ({ roomCode: room.roomCode, playerId, nickname, avatarId }),
    [avatarId, nickname, playerId, room.roomCode],
  );

  const applyLobbyState = useCallback((payload: unknown) => {
    const parsed = lobbyStateSchema.safeParse(payload);
    if (parsed.success) setLobbyState(parsed.data);
  }, []);

  const flushPendingProfile = useCallback(() => {
    const pendingProfile = pendingProfileRef.current;
    const socket = lobbySocketRef.current;
    if (!pendingProfile || !socket?.connected || !lobbyJoinedRef.current) return;

    pendingProfileRef.current = undefined;
    socket.emit(ClientEvent.SET_PLAYER_INFO, pendingProfile);
  }, []);

  const applyReaction = useCallback((payload: unknown) => {
    const parsed = reactionEventSchema.safeParse(payload);
    if (!parsed.success) return;
    setRecentReactions((current) => [parsed.data, ...current].slice(0, 6));
  }, []);

  useEffect(() => {
    const lobbySocket = io(`${socketBaseUrl}/lobby`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });
    const gameSocket = io(`${socketBaseUrl}/game`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });
    lobbySocketRef.current = lobbySocket;
    gameSocketRef.current = gameSocket;

    const handleError = (payload: unknown) => {
      const message = readError(payload);
      if (message === 'Join lobby before sending events') return;
      setConnectionStatus('error');
      setError(message);
    };

    lobbySocket.on('connect', () => {
      lobbyJoinedRef.current = false;
      setConnectionStatus('connected');
      setError(null);
      lobbySocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    gameSocket.on('connect', () => {
      gameJoinedRef.current = false;
      gameSocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    lobbySocket.on('disconnect', () => setConnectionStatus('offline'));
    lobbySocket.on('connect_error', (event: Error) => {
      setConnectionStatus('error');
      setError(`Lobby socket: ${event.message}`);
    });
    lobbySocket.io.on('reconnect_attempt', () => setConnectionStatus('reconnecting'));
    lobbySocket.io.on('reconnect', () => setConnectionStatus('connected'));

    lobbySocket.on(ServerEvent.LOBBY_STATE, (payload: unknown) => {
      lobbyJoinedRef.current = true;
      applyLobbyState(payload);
      flushPendingProfile();
    });
    lobbySocket.on(ServerEvent.PLAYER_JOINED, applyLobbyState);
    lobbySocket.on(ServerEvent.PLAYER_LEFT, applyLobbyState);
    lobbySocket.on(ServerEvent.PLAYER_UPDATED, applyLobbyState);
    lobbySocket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
    lobbySocket.on(ServerEvent.ERROR, handleError);

    gameSocket.on(ServerEvent.LOBBY_STATE, (payload: unknown) => {
      gameJoinedRef.current = true;
      applyLobbyState(payload);
    });
    gameSocket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
    gameSocket.on(ServerEvent.ERROR, handleError);
    gameSocket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
      const parsed = gameStartingEventSchema.safeParse(payload);
      if (parsed.success) setGameState({ phase: 'starting', event: parsed.data });
    });
    gameSocket.on(ServerEvent.ROUND_START, (payload: unknown) => {
      const parsed = roundStartEventSchema.safeParse(payload);
      if (!parsed.success) return;
      currentRoundRef.current = parsed.data;
      setGameState({
        phase: 'question',
        round: parsed.data,
        timer: buildInitialTimer(parsed.data),
      });
    });
    gameSocket.on(ServerEvent.TIMER_TICK, (payload: unknown) => {
      const parsed = timerTickEventSchema.safeParse(payload);
      if (!parsed.success) return;
      setGameState((current) => {
        if (current.phase !== 'question' || !currentRoundRef.current) return current;
        return { ...current, timer: parsed.data };
      });
    });
    gameSocket.on(ServerEvent.ANSWER_ACCEPTED, (payload: unknown) => {
      const parsed = answerAcceptedEventSchema.safeParse(payload);
      if (!parsed.success) return;
      setGameState((current) => {
        if (current.phase !== 'question') return current;
        return { ...current, accepted: parsed.data, selectedAnswerIndex: parsed.data.answerIndex };
      });
    });
    gameSocket.on(ServerEvent.ROUND_END, (payload: unknown) => {
      const parsed = roundEndEventSchema.safeParse(payload);
      if (parsed.success) {
        setGameState({
          phase: 'reveal',
          roundEnd: parsed.data,
          ...(currentRoundRef.current ? { round: currentRoundRef.current } : {}),
        });
      }
    });
    gameSocket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
      const parsed = reactionWindowEventSchema.safeParse(payload);
      if (!parsed.success) return;
      setGameState((current) => {
        if (current.phase !== 'reveal') return current;
        return { ...current, reactionWindow: parsed.data };
      });
    });
    gameSocket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, (payload: unknown) => {
      const parsed = nextRoundCountdownEventSchema.safeParse(payload);
      if (!parsed.success) return;
      setGameState((current) => {
        if (current.phase !== 'reveal') return current;
        return { ...current, nextRound: parsed.data };
      });
    });
    gameSocket.on(ServerEvent.GAME_END, (payload: unknown) => {
      const parsed = gameEndEventSchema.safeParse(payload);
      if (parsed.success) setGameState({ phase: 'final', event: parsed.data });
    });

    return () => {
      lobbySocket.disconnect();
      gameSocket.disconnect();
      lobbyJoinedRef.current = false;
      gameJoinedRef.current = false;
      lobbySocketRef.current = null;
      gameSocketRef.current = null;
    };
  }, [applyLobbyState, applyReaction, flushPendingProfile, joinPayload]);

  const reconnect = useCallback(() => {
    setConnectionStatus('reconnecting');
    lobbySocketRef.current?.connect();
    gameSocketRef.current?.connect();
  }, []);

  const setReady = useCallback((ready: boolean) => {
    if (!lobbyJoinedRef.current) return;
    lobbySocketRef.current?.emit(ClientEvent.SET_READY, { ready });
  }, []);

  const updateProfile = useCallback((next: { avatarId: string; nickname: string }) => {
    if (!lobbyJoinedRef.current) {
      pendingProfileRef.current = next;
      return;
    }
    lobbySocketRef.current?.emit(ClientEvent.SET_PLAYER_INFO, next);
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    if (!lobbyJoinedRef.current) return;
    lobbySocketRef.current?.emit(ClientEvent.SEND_REACTION, { emoji });
  }, []);

  const submitAnswer = useCallback((questionId: string, answerIndex: number) => {
    setGameState((current) => {
      if (current.phase !== 'question' || current.accepted) return current;
      return { ...current, selectedAnswerIndex: answerIndex };
    });
    if (!gameJoinedRef.current) return;
    gameSocketRef.current?.emit(ClientEvent.SUBMIT_ANSWER, {
      questionId,
      answerIndex,
      submittedAt: Date.now(),
    });
  }, []);

  const ownPlayer = lobbyState?.players.find((player) => player.playerId === playerId);

  return {
    connectionStatus,
    error,
    gameState,
    lobbyState,
    ownPlayer,
    recentReactions,
    reconnect,
    sendReaction,
    setReady,
    submitAnswer,
    updateProfile,
  };
}
