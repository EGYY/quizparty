import { readStoredPlayerToken } from '@entities/player';
import type { LobbyState, ReactionEvent } from '@quizparty/shared';
import type { GameSocket } from '@shared/lib/socket';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PhoneConnectionStatus, UsePhoneGameParams } from './types';
import { useGameSocket } from './use-game-socket';
import { useLobbySocket } from './use-lobby-socket';

export function usePhoneGame({ avatarId, nickname, playerId, room }: UsePhoneGameParams) {
  const [connectionStatus, setConnectionStatus] = useState<PhoneConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyState>();
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);

  // Socket refs owned by orchestrator so both hooks can access each other's socket
  const lobbySocketRef = useRef<GameSocket | null>(null);
  const gameSocketRef = useRef<GameSocket | null>(null);

  // Coordination refs shared by both sockets
  const playerTokenRef = useRef<string | null>(readStoredPlayerToken(room.roomCode) ?? null);
  const lobbyFirstJoinDoneRef = useRef(false);
  const gameJoinPendingRef = useRef(false);

  // Per-socket state refs owned by orchestrator and passed to sub-hooks
  const lobbyJoinedRef = useRef(false);
  const gameJoinedRef = useRef(false);
  const pendingProfileRef = useRef<{ avatarId: string; nickname: string } | undefined>(undefined);

  const joinPayloadRef = useRef({ roomCode: room.roomCode, playerId, nickname, avatarId });
  useEffect(() => {
    joinPayloadRef.current = { roomCode: room.roomCode, playerId, nickname, avatarId };
  }, [avatarId, nickname, playerId, room.roomCode]);

  const pushReaction = useCallback((reaction: ReactionEvent) => {
    setRecentReactions((current) => [reaction, ...current].slice(0, 6));
  }, []);

  const { gameState, roomClosed, submitAnswer } = useGameSocket({
    gameJoinPendingRef,
    gameSocketRef,
    gameJoinedRef,
    joinPayloadRef,
    lobbyFirstJoinDoneRef,
    playerTokenRef,
    pushReaction,
    roomCode: room.roomCode,
    setError,
    setFatalError,
    setLobbyState,
  });

  const { setReady, sendReaction, updateProfile } = useLobbySocket({
    gameJoinPendingRef,
    gameSocketRef,
    joinPayloadRef,
    lobbyFirstJoinDoneRef,
    lobbyJoinedRef,
    lobbySocketRef,
    pendingProfileRef,
    playerTokenRef,
    pushReaction,
    roomCode: room.roomCode,
    setConnectionStatus,
    setError,
    setFatalError,
    setLobbyState,
  });

  const reconnect = useCallback(() => {
    setConnectionStatus('reconnecting');
    lobbySocketRef.current?.connect();
    gameSocketRef.current?.connect();
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
