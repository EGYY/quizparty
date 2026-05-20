import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TvRoute } from '@app/navigation';
import { useTvNavigation } from '@app/navigation';
import { useToast } from '@app/toast-provider';
import { useLobbyRealtime } from '@entities/room';
import {
  getConnectedPlayerCount,
  getIsLobbyStarting,
  getLobbyMascotSpeech,
  getLobbyStartLabel,
} from './lobby-page';

type LobbyRoute = Extract<TvRoute, { name: 'lobby' }>;

export function useLobbyPage(route: LobbyRoute) {
  const navigation = useTvNavigation();
  const toast = useToast();
  const lobby = useLobbyRealtime({ quiz: route.quiz, room: route.room });
  const didNavigate = useRef(false);

  const connectedCount = useMemo(
    () => getConnectedPlayerCount(lobby.state),
    [lobby.state],
  );
  const isStarting = getIsLobbyStarting({
    phase: lobby.state.phase,
    liveStatus: lobby.liveStatus,
  });
  const startLabel = useMemo(
    () => getLobbyStartLabel({ isStarting, liveStatus: lobby.liveStatus }),
    [isStarting, lobby.liveStatus],
  );
  const mascotSpeech = useMemo(
    () => getLobbyMascotSpeech(connectedCount, lobby.state.maxPlayers),
    [connectedCount, lobby.state.maxPlayers],
  );
  const handleBack = useCallback(() => navigation.back(), [navigation]);

  useEffect(() => {
    if (lobby.error) toast.notify(lobby.error, 'error');
  }, [lobby.error, toast]);

  useEffect(() => {
    if (
      lobby.liveStatus.kind !== 'starting' ||
      !lobby.playerId ||
      didNavigate.current
    )
      return;
    didNavigate.current = true;
    navigation.navigate({
      name: 'game',
      playerId: lobby.playerId,
      quiz: route.quiz,
      room: route.room,
    });
  }, [
    lobby.liveStatus.kind,
    lobby.playerId,
    navigation,
    route.quiz,
    route.room,
  ]);

  return {
    connectedCount,
    handleBack,
    isStarting,
    lobby,
    mascotSpeech,
    startLabel,
  };
}
