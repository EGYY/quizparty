import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ClientEvent,
  ServerEvent,
  answerProgressEventSchema,
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
import { io, type Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '@shared/config/env';
import { dedupeLobbyStatePlayers, type TvRoom } from '@entities/room';

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

type UseTvGameRealtimeParams = {
  playerId: string;
  room: TvRoom;
};

function readError(payload: unknown): string {
  const parsed = wsErrorEventSchema.safeParse(payload);
  if (parsed.success) return parsed.data.message;
  if (payload instanceof Error) return payload.message;
  return 'Ошибка realtime-соединения';
}

function makeJoinPayload(room: TvRoom, playerId: string) {
  return {
    roomCode: room.roomCode,
    playerId,
    nickname: 'TV ведущий',
    avatarId: 'popcorn-mascot',
  };
}

function buildInitialTimer(round: RoundStartEvent): TimerTickEvent {
  return {
    remainingSeconds: Math.max(
      0,
      Math.ceil((round.roundEndTime - Date.now()) / 1000),
    ),
    totalSeconds: Math.max(
      1,
      Math.ceil((round.roundEndTime - round.serverTime) / 1000),
    ),
    serverTime: Date.now(),
  };
}

export function useTvGameRealtime({ playerId, room }: UseTvGameRealtimeParams) {
  const [connectionStatus, setConnectionStatus] =
    useState<TvGameConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<TvGameState>({ phase: 'waiting' });
  const [lobbyState, setLobbyState] = useState<LobbyState | undefined>(
    undefined,
  );
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);
  const gameSocketRef = useRef<Socket | null>(null);
  const lobbySocketRef = useRef<Socket | null>(null);
  const currentRoundRef = useRef<RoundStartEvent | undefined>(undefined);

  const joinPayload = useMemo(
    () => makeJoinPayload(room, playerId),
    [playerId, room],
  );

  const applyLobbyState = useCallback((payload: unknown) => {
    const parsed = lobbyStateSchema.safeParse(payload);
    if (!parsed.success) return;
    setLobbyState(dedupeLobbyStatePlayers(parsed.data));
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

  const attachGameEvents = useCallback(
    (socket: Socket) => {
      socket.on(ServerEvent.LOBBY_STATE, applyLobbyState);
      socket.on(ServerEvent.REACTION_RECEIVED, applyReaction);
      socket.on(ServerEvent.ERROR, (payload: unknown) => {
        setConnectionStatus('error');
        setError(readError(payload));
      });
      socket.on(ServerEvent.GAME_STARTING, (payload: unknown) => {
        const parsed = gameStartingEventSchema.safeParse(payload);
        if (parsed.success) {
          setGameState({ phase: 'starting', event: parsed.data });
        }
      });
      socket.on(ServerEvent.ROUND_START, (payload: unknown) => {
        const parsed = roundStartEventSchema.safeParse(payload);
        if (parsed.success) {
          currentRoundRef.current = parsed.data;
          setGameState({
            phase: 'question',
            round: parsed.data,
            timer: buildInitialTimer(parsed.data),
          });
        }
      });
      socket.on(ServerEvent.TIMER_TICK, (payload: unknown) => {
        const parsed = timerTickEventSchema.safeParse(payload);
        if (!parsed.success || !currentRoundRef.current) return;

        setGameState(current => {
          if (current.phase !== 'question') {
            return {
              phase: 'question',
              round: currentRoundRef.current as RoundStartEvent,
              timer: parsed.data,
            };
          }

          return {
            ...current,
            timer: parsed.data,
          };
        });
      });
      socket.on(ServerEvent.ANSWER_PROGRESS, (payload: unknown) => {
        const parsed = answerProgressEventSchema.safeParse(payload);
        if (!parsed.success) return;

        setGameState(current => {
          if (current.phase !== 'question') return current;
          return {
            ...current,
            progress: parsed.data,
          };
        });
      });
      socket.on(ServerEvent.ROUND_END, (payload: unknown) => {
        const parsed = roundEndEventSchema.safeParse(payload);
        if (parsed.success) {
          setGameState({
            phase: 'reveal',
            round: currentRoundRef.current,
            roundEnd: parsed.data,
          });
        }
      });
      socket.on(ServerEvent.REACTION_WINDOW_OPEN, (payload: unknown) => {
        const parsed = reactionWindowEventSchema.safeParse(payload);
        if (!parsed.success) return;

        setGameState(current => {
          if (current.phase !== 'reveal') return current;
          return {
            ...current,
            reactionWindow: parsed.data,
          };
        });
      });
      socket.on(ServerEvent.NEXT_ROUND_COUNTDOWN, (payload: unknown) => {
        const parsed = nextRoundCountdownEventSchema.safeParse(payload);
        if (!parsed.success) return;

        setGameState(current => {
          if (current.phase !== 'reveal') return current;
          return {
            ...current,
            nextRound: parsed.data,
          };
        });
      });
      socket.on(ServerEvent.GAME_END, (payload: unknown) => {
        const parsed = gameEndEventSchema.safeParse(payload);
        if (parsed.success) {
          setGameState({ phase: 'final', event: parsed.data });
        }
      });
    },
    [applyLobbyState, applyReaction],
  );

  useEffect(() => {
    const gameSocket = io(`${SOCKET_BASE_URL}/game`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });
    const lobbySocket = io(`${SOCKET_BASE_URL}/lobby`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });
    gameSocketRef.current = gameSocket;
    lobbySocketRef.current = lobbySocket;
    attachGameEvents(gameSocket);
    lobbySocket.on(ServerEvent.ERROR, (payload: unknown) =>
      setError(readError(payload)),
    );

    gameSocket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);
      gameSocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    lobbySocket.on('connect', () => {
      lobbySocket.emit(ClientEvent.JOIN_LOBBY, joinPayload);
    });
    gameSocket.on('disconnect', () => setConnectionStatus('offline'));
    gameSocket.on('connect_error', (event: Error) => {
      setConnectionStatus('error');
      setError(`Game socket: ${event.message}`);
    });
    gameSocket.io.on('reconnect_attempt', () =>
      setConnectionStatus('reconnecting'),
    );
    gameSocket.io.on('reconnect', () => setConnectionStatus('connected'));

    return () => {
      gameSocket.disconnect();
      lobbySocket.disconnect();
      gameSocketRef.current = null;
      lobbySocketRef.current = null;
    };
  }, [attachGameEvents, joinPayload]);

  const reconnect = useCallback(() => {
    setConnectionStatus('reconnecting');
    gameSocketRef.current?.connect();
    lobbySocketRef.current?.connect();
  }, []);

  const playAgain = useCallback(() => {
    const socket = lobbySocketRef.current;
    if (!socket?.connected) {
      setError('Нет соединения с lobby socket для перезапуска');
      socket?.connect();
      return;
    }

    socket.emit(ClientEvent.START_GAME);
  }, []);

  return {
    connectionStatus,
    error,
    gameState,
    lobbyState,
    playAgain,
    recentReactions,
    reconnect,
  };
}
