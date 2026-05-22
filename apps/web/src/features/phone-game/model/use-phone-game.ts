import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { LobbyState, ReactionEvent, RoundStartEvent, WsErrorEvent } from '@quizparty/shared';
import {
  clearStoredPlayerToken,
  readStoredPlayerToken,
  saveStoredPlayerToken,
} from '@entities/player';
import { createGameSocket, type GameSocket } from '@shared/lib/socket';
import { buildInitialTimer } from '../lib/build-initial-timer';
import { socketBaseUrl, socketOptions } from '../lib/socket-config';
import { terminalErrorMessage } from '../lib/terminal-error-message';
import type { PhoneConnectionStatus, PhoneGameState, UsePhoneGameParams } from './types';

export function usePhoneGame({ avatarId, nickname, playerId, room }: UsePhoneGameParams) {
  const [connectionStatus, setConnectionStatus] = useState<PhoneConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyState>();
  const [gameState, setGameState] = useState<PhoneGameState>({ phase: 'lobby' });
  const [roomClosed, setRoomClosed] = useState(false);
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);
  const lobbySocketRef = useRef<GameSocket | null>(null);
  const gameSocketRef = useRef<GameSocket | null>(null);
  const currentRoundRef = useRef<RoundStartEvent | undefined>(undefined);
  const lobbyJoinedRef = useRef(false);
  const gameJoinedRef = useRef(false);
  const pendingProfileRef = useRef<{ avatarId: string; nickname: string } | undefined>(undefined);
  const gameStateRef = useRef(gameState);

  const joinPayloadRef = useRef({ roomCode: room.roomCode, playerId, nickname, avatarId });
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    joinPayloadRef.current = { roomCode: room.roomCode, playerId, nickname, avatarId };
  }, [avatarId, nickname, playerId, room.roomCode]);

  // Подписанный сервером player-token (анти-спуфинг playerId). Читаем из
  // localStorage при монтировании; обновляем после каждого LOBBY_STATE.
  const playerTokenRef = useRef<string | null>(readStoredPlayerToken(room.roomCode) ?? null);
  // Координация двух сокетов: game ждёт первого ответа lobby (с токеном),
  // чтобы strict-mode на сервере не отверг token-less повторный захват playerId.
  const lobbyFirstJoinDoneRef = useRef(false);
  const gameJoinPendingRef = useRef(false);

  const flushPendingProfile = useCallback(() => {
    const pendingProfile = pendingProfileRef.current;
    const socket = lobbySocketRef.current;
    if (!pendingProfile || !socket?.connected || !lobbyJoinedRef.current) return;

    pendingProfileRef.current = undefined;
    socket.emit(ClientEvent.SET_PLAYER_INFO, pendingProfile);
  }, []);

  const pushReaction = useCallback((reaction: ReactionEvent) => {
    setRecentReactions((current) => [reaction, ...current].slice(0, 6));
  }, []);

  useEffect(() => {
    const lobby = createGameSocket(`${socketBaseUrl}/lobby`, socketOptions);
    const game = createGameSocket(`${socketBaseUrl}/game`, socketOptions);
    lobbySocketRef.current = lobby;
    gameSocketRef.current = game;

    const handleError = (data: WsErrorEvent) => {
      if (data.message === 'Join lobby before sending events') return;
      const fatal = terminalErrorMessage(data.code);
      if (fatal) {
        setFatalError(fatal);
        setConnectionStatus('error');
        return;
      }
      setConnectionStatus('error');
      setError(data.message);
    };

    const buildJoinPayload = () => ({
      ...joinPayloadRef.current,
      ...(playerTokenRef.current ? { playerToken: playerTokenRef.current } : {}),
    });

    lobby.onConnect(() => {
      lobbyJoinedRef.current = false;
      setConnectionStatus('connected');
      setError(null);
      lobby.emit(ClientEvent.JOIN_LOBBY, buildJoinPayload());
    });
    game.onConnect(() => {
      gameJoinedRef.current = false;
      // game ждёт первый LOBBY_STATE от lobby (с токеном), если ещё нет
      // закэшированного токена — это покрывает strict-mode сервера.
      if (playerTokenRef.current || lobbyFirstJoinDoneRef.current) {
        game.emit(ClientEvent.JOIN_LOBBY, buildJoinPayload());
      } else {
        gameJoinPendingRef.current = true;
      }
    });
    lobby.onDisconnect(() => setConnectionStatus('offline'));
    lobby.onConnectError((event) => {
      setConnectionStatus('error');
      setError(`Lobby socket: ${event.message}`);
    });
    lobby.onReconnectAttempt(() => setConnectionStatus('reconnecting'));
    lobby.onReconnect(() => setConnectionStatus('connected'));

    lobby.on(ServerEvent.LOBBY_STATE, (data) => {
      lobbyJoinedRef.current = true;
      if (data.playerToken && data.playerToken !== playerTokenRef.current) {
        playerTokenRef.current = data.playerToken;
        saveStoredPlayerToken(room.roomCode, data.playerToken);
      }
      lobbyFirstJoinDoneRef.current = true;
      setLobbyState(data);
      flushPendingProfile();
      // Игровой сокет ждал токен — теперь можно отправить JOIN_LOBBY.
      if (gameJoinPendingRef.current && gameSocketRef.current?.connected) {
        gameJoinPendingRef.current = false;
        gameSocketRef.current.emit(ClientEvent.JOIN_LOBBY, buildJoinPayload());
      }
    });
    lobby.on(ServerEvent.PLAYER_JOINED, (data) => setLobbyState(data));
    lobby.on(ServerEvent.PLAYER_LEFT, (data) => setLobbyState(data));
    lobby.on(ServerEvent.PLAYER_UPDATED, (data) => setLobbyState(data));
    lobby.on(ServerEvent.REACTION_RECEIVED, pushReaction);
    lobby.on(ServerEvent.ERROR, handleError);

    game.on(ServerEvent.LOBBY_STATE, (data) => {
      gameJoinedRef.current = true;
      if (data.playerToken && data.playerToken !== playerTokenRef.current) {
        playerTokenRef.current = data.playerToken;
        saveStoredPlayerToken(room.roomCode, data.playerToken);
      }
      setLobbyState(data);
    });
    game.on(ServerEvent.REACTION_RECEIVED, pushReaction);
    game.on(ServerEvent.ERROR, handleError);
    game.on(ServerEvent.GAME_STARTING, (data) => {
      setGameState({ phase: 'starting', event: data });
    });
    game.on(ServerEvent.ROUND_START, (data) => {
      currentRoundRef.current = data;
      setGameState({ phase: 'question', round: data, timer: buildInitialTimer(data) });
    });
    game.on(ServerEvent.ANSWER_WINDOW_OPEN, (data) => {
      if (currentRoundRef.current?.question.id === data.questionId) {
        currentRoundRef.current = {
          ...currentRoundRef.current,
          answerStartTime: data.answerStartTime,
          roundEndTime: data.roundEndTime,
          question: {
            ...currentRoundRef.current.question,
            options: data.options,
          },
        };
      }
      setGameState((current) => {
        if (current.phase !== 'question') return current;
        if (current.round.question.id !== data.questionId) return current;
        return {
          ...current,
          answerWindow: data,
          round: {
            ...current.round,
            answerStartTime: data.answerStartTime,
            roundEndTime: data.roundEndTime,
            question: {
              ...current.round.question,
              options: data.options,
            },
          },
          timer: {
            remainingSeconds: Math.max(0, Math.ceil((data.roundEndTime - Date.now()) / 1000)),
            totalSeconds: Math.max(1, Math.ceil((data.roundEndTime - data.answerStartTime) / 1000)),
            serverTime: data.serverTime,
            stage: 'answering',
          },
        };
      });
    });
    game.on(ServerEvent.TIMER_TICK, (data) => {
      setGameState((current) => {
        if (current.phase !== 'question' || !currentRoundRef.current) return current;
        if (current.isPaused) return current;
        if (
          current.timer.remainingSeconds === data.remainingSeconds &&
          current.timer.totalSeconds === data.totalSeconds
        ) {
          return current;
        }
        return { ...current, timer: data };
      });
    });
    game.on(ServerEvent.ANSWER_ACCEPTED, (data) => {
      setGameState((current) => {
        if (current.phase !== 'question') return current;
        return { ...current, accepted: data, selectedAnswerIndex: data.answerIndex };
      });
    });
    game.on(ServerEvent.ROUND_END, (data) => {
      setGameState({
        phase: 'reveal',
        roundEnd: data,
        ...(currentRoundRef.current ? { round: currentRoundRef.current } : {}),
      });
    });
    game.on(ServerEvent.REACTION_WINDOW_OPEN, (data) => {
      setGameState((current) => {
        if (current.phase !== 'reveal') return current;
        return { ...current, reactionWindow: data };
      });
    });
    game.on(ServerEvent.NEXT_ROUND_COUNTDOWN, (data) => {
      setGameState((current) => {
        if (current.phase !== 'reveal') return current;
        if (current.isPaused) return current;
        return { ...current, nextRound: data };
      });
    });
    game.on(ServerEvent.GAME_END, (data) => {
      setGameState({ phase: 'final', event: data });
    });
    game.on(ServerEvent.GAME_PAUSED, (data) => {
      setGameState((current) => {
        if (current.phase !== 'question' && current.phase !== 'reveal') return current;
        return { ...current, isPaused: true, pause: data };
      });
    });
    game.on(ServerEvent.GAME_RESUMED, (data) => {
      setGameState((current) => {
        if (current.phase === 'question') {
          return {
            ...current,
            isPaused: false,
            pause: undefined,
            timer: {
              ...current.timer,
              remainingSeconds: Math.ceil(data.remainingMs / 1000),
              serverTime: data.serverTime,
            },
          };
        }
        if (current.phase === 'reveal') {
          return {
            ...current,
            isPaused: false,
            pause: undefined,
            ...(current.nextRound
              ? {
                  nextRound: {
                    ...current.nextRound,
                    nextRoundStartsAt: data.targetTime,
                    remainingSeconds: Math.ceil(data.remainingMs / 1000),
                    serverTime: data.serverTime,
                  },
                }
              : {}),
            ...(current.reactionWindow
              ? {
                  reactionWindow: {
                    ...current.reactionWindow,
                    closesAt: data.targetTime,
                    serverTime: data.serverTime,
                  },
                }
              : {}),
          };
        }
        return current;
      });
    });
    game.on(ServerEvent.ROOM_CLOSED, () => {
      clearStoredPlayerToken(room.roomCode);
      setRoomClosed(true);
    });

    return () => {
      lobby.disconnect();
      game.disconnect();
      lobbyJoinedRef.current = false;
      gameJoinedRef.current = false;
      lobbySocketRef.current = null;
      gameSocketRef.current = null;
    };
  }, [flushPendingProfile, pushReaction, playerId, room.roomCode]);

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
    const currentGameState = gameStateRef.current;
    if (
      currentGameState.phase !== 'question' ||
      currentGameState.accepted ||
      currentGameState.isPaused ||
      !currentGameState.round.question.options
    ) {
      return;
    }

    setGameState((current) => {
      if (
        current.phase !== 'question' ||
        current.accepted ||
        current.isPaused ||
        !current.round.question.options
      ) {
        return current;
      }
      return { ...current, selectedAnswerIndex: answerIndex };
    });
    if (!gameJoinedRef.current) return;
    gameSocketRef.current?.emit(ClientEvent.SUBMIT_ANSWER, {
      questionId,
      answerIndex,
      submittedAt: Date.now(),
    });
  }, []);

  const ownPlayer = useMemo(
    () => lobbyState?.players.find((player) => player.playerId === playerId),
    [lobbyState?.players, playerId],
  );

  return {
    connectionStatus,
    error,
    fatalError,
    gameState,
    lobbyState,
    ownPlayer,
    recentReactions,
    reconnect,
    roomClosed,
    sendReaction,
    setReady,
    submitAnswer,
    updateProfile,
  };
}
