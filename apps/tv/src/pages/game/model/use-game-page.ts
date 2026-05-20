import { useMemo } from 'react';
import type { TvRoute } from '@app/navigation';
import { useTvNavigation } from '@app/navigation';
import { useTvGameRealtime } from '@entities/game';

type GameRoute = Extract<TvRoute, { name: 'game' }>;

export function useGamePage(route: GameRoute) {
  const navigation = useTvNavigation();
  const game = useTvGameRealtime({
    playerId: route.playerId,
    playerToken: route.playerToken,
    room: route.room,
  });

  const playerCount = game.lobbyState?.players.length ?? 0;
  const hasImmersiveChrome = useMemo(
    () =>
      game.gameState.phase === 'question' ||
      game.gameState.phase === 'reveal' ||
      game.gameState.phase === 'final',
    [game.gameState.phase],
  );

  return {
    game,
    hasImmersiveChrome,
    navigation,
    playerCount,
  };
}
