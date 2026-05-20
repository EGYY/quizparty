import type { LobbyState, Player } from '@quizparty/shared';

export function dedupeLobbyStatePlayers(state: LobbyState): LobbyState {
  const playerOrder: string[] = [];
  const playersById = new Map<string, Player>();

  for (const player of state.players) {
    if (!playersById.has(player.playerId)) playerOrder.push(player.playerId);
    playersById.set(player.playerId, {
      ...playersById.get(player.playerId),
      ...player,
    });
  }

  return {
    ...state,
    players: playerOrder
      .map(playerId => playersById.get(playerId))
      .filter((player): player is Player => Boolean(player)),
  };
}
