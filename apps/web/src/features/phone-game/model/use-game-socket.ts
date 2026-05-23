import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { LobbyState, ReactionEvent, RoundStartEvent, WsErrorEvent } from '@quizparty/shared';
import { clearStoredPlayerToken, saveStoredPlayerToken } from '@entities/player';
import type { GameSocket } from '@shared/lib/socket';
import { createGameSocket } from '@shared/lib/socket';
import { buildInitialTimer } from '../lib/build-initial-timer';
import { socketBaseUrl, socketOptions } from '../lib/socket-config';
import { terminalErrorMessage } from '../lib/terminal-error-message';
import type { PhoneGameState } from './types';

type JoinPayload = { avatarId: string; nickname: string; playerId: string; roomCode: string };

export function useGameSocket({
  gameJoinPendingRef,
  gameSocketRef,
  joinPayloadRef,
  lobbyFirstJoinDoneRef,
  gameJoinedRef,
  playerTokenRef,
  pushReaction,
  roomCode,
  setError,
  setFatalError,
  setLobbyState,
}: {
  gameJoinPendingRef: MutableRefObject<boolean>;
  gameSocketRef: MutableRefObject<GameSocket | null>;
  joinPayloadRef: MutableRefObject<JoinPayload>;
  lobbyFirstJoinDoneRef: MutableRefObject<boolean>;
  gameJoinedRef: MutableRefObject<boolean>;
  playerTokenRef: MutableRefObject<string | null>;
  pushReaction: (reaction: ReactionEvent) => void;
  roomCode: string;
  setError: (error: string | null) => void;
  setFatalError: (error: string) => void;
  setLobbyState: (state: LobbyState) => void;
}) {
  const [gameState, setGameState] = useState<PhoneGameState>({ phase: 'lobby' });
  const [roomClosed, setRoomClosed] = useState(false);
  const currentRoundRef = useRef<RoundStartEvent | undefined>(undefined);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const game = createGameSocket(`${socketBaseUrl}/game`, socketOptions);
    gameSocketRef.current = game;

    const buildJoinPayload = () => ({
      ...joinPayloadRef.current,
      ...(playerTokenRef.current ? { playerToken: playerTokenRef.current } : {}),
    });

    const handleError = (data: WsErrorEvent) => {
      if (data.message === 'Join lobby before sending events') return;
      const fatal = terminalErrorMessage(data.code);
      if (fatal) {
        setFatalError(fatal);
        return;
      }
      setError(data.message);
    };

    game.onConnect(() => {
      gameJoinedRef.current = false;
      if (playerTokenRef.current || lobbyFirstJoinDoneRef.current) {
        game.emit(ClientEvent.JOIN_LOBBY, buildJoinPayload());
      } else {
        gameJoinPendingRef.current = true;
      }
    });

    game.on(ServerEvent.LOBBY_STATE, (data) => {
      gameJoinedRef.current = true;
      if (data.playerToken && data.playerToken !== playerTokenRef.current) {
        playerTokenRef.current = data.playerToken;
        saveStoredPlayerToken(roomCode, data.playerToken);
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
      clearStoredPlayerToken(roomCode);
      setRoomClosed(true);
    });

    return () => {
      game.disconnect();
      gameJoinedRef.current = false;
      gameSocketRef.current = null;
    };
  }, [
    pushReaction,
    roomCode,
    gameJoinPendingRef,
    gameSocketRef,
    gameJoinedRef,
    joinPayloadRef,
    lobbyFirstJoinDoneRef,
    playerTokenRef,
    setError,
    setFatalError,
    setLobbyState,
  ]);

  const submitAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
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
    },
    [gameJoinedRef, gameSocketRef],
  );

  return { gameState, roomClosed, submitAnswer };
}
