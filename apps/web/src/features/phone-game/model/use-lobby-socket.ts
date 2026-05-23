import { useCallback, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { ClientEvent, ServerEvent } from '@quizparty/shared';
import type { LobbyState, ReactionEvent, WsErrorEvent } from '@quizparty/shared';
import { saveStoredPlayerToken } from '@entities/player';
import type { GameSocket } from '@shared/lib/socket';
import { createGameSocket } from '@shared/lib/socket';
import { socketBaseUrl, socketOptions } from '../lib/socket-config';
import { terminalErrorMessage } from '../lib/terminal-error-message';
import type { PhoneConnectionStatus } from './types';

type JoinPayload = { avatarId: string; nickname: string; playerId: string; roomCode: string };

export function useLobbySocket({
  gameJoinPendingRef,
  gameSocketRef,
  joinPayloadRef,
  lobbyFirstJoinDoneRef,
  lobbyJoinedRef,
  lobbySocketRef,
  pendingProfileRef,
  playerTokenRef,
  pushReaction,
  roomCode,
  setConnectionStatus,
  setError,
  setFatalError,
  setLobbyState,
}: {
  gameJoinPendingRef: MutableRefObject<boolean>;
  gameSocketRef: MutableRefObject<GameSocket | null>;
  joinPayloadRef: MutableRefObject<JoinPayload>;
  lobbyFirstJoinDoneRef: MutableRefObject<boolean>;
  lobbyJoinedRef: MutableRefObject<boolean>;
  lobbySocketRef: MutableRefObject<GameSocket | null>;
  pendingProfileRef: MutableRefObject<{ avatarId: string; nickname: string } | undefined>;
  playerTokenRef: MutableRefObject<string | null>;
  pushReaction: (reaction: ReactionEvent) => void;
  roomCode: string;
  setConnectionStatus: (status: PhoneConnectionStatus) => void;
  setError: (error: string | null) => void;
  setFatalError: (error: string) => void;
  setLobbyState: (state: LobbyState) => void;
}) {
  const flushPendingProfile = useCallback(() => {
    const pending = pendingProfileRef.current;
    const socket = lobbySocketRef.current;
    if (!pending || !socket?.connected || !lobbyJoinedRef.current) return;
    pendingProfileRef.current = undefined;
    socket.emit(ClientEvent.SET_PLAYER_INFO, pending);
  }, [lobbyJoinedRef, lobbySocketRef, pendingProfileRef]);

  useEffect(() => {
    const lobby = createGameSocket(`${socketBaseUrl}/lobby`, socketOptions);
    lobbySocketRef.current = lobby;

    const buildJoinPayload = () => ({
      ...joinPayloadRef.current,
      ...(playerTokenRef.current ? { playerToken: playerTokenRef.current } : {}),
    });

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

    lobby.onConnect(() => {
      lobbyJoinedRef.current = false;
      setConnectionStatus('connected');
      setError(null);
      lobby.emit(ClientEvent.JOIN_LOBBY, buildJoinPayload());
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
        saveStoredPlayerToken(roomCode, data.playerToken);
      }
      lobbyFirstJoinDoneRef.current = true;
      setLobbyState(data);
      flushPendingProfile();
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

    return () => {
      lobby.disconnect();
      lobbyJoinedRef.current = false;
      lobbySocketRef.current = null;
    };
  }, [
    flushPendingProfile,
    pushReaction,
    roomCode,
    gameJoinPendingRef,
    gameSocketRef,
    joinPayloadRef,
    lobbyFirstJoinDoneRef,
    lobbyJoinedRef,
    lobbySocketRef,
    playerTokenRef,
    setConnectionStatus,
    setError,
    setFatalError,
    setLobbyState,
  ]);

  const setReady = useCallback(
    (ready: boolean) => {
      if (!lobbyJoinedRef.current) return;
      lobbySocketRef.current?.emit(ClientEvent.SET_READY, { ready });
    },
    [lobbyJoinedRef, lobbySocketRef],
  );

  const updateProfile = useCallback(
    (next: { avatarId: string; nickname: string }) => {
      if (!lobbyJoinedRef.current) {
        pendingProfileRef.current = next;
        return;
      }
      lobbySocketRef.current?.emit(ClientEvent.SET_PLAYER_INFO, next);
    },
    [lobbyJoinedRef, lobbySocketRef, pendingProfileRef],
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      if (!lobbyJoinedRef.current) return;
      lobbySocketRef.current?.emit(ClientEvent.SEND_REACTION, { emoji });
    },
    [lobbyJoinedRef, lobbySocketRef],
  );

  return { setReady, sendReaction, updateProfile };
}
