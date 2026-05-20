import {
  LobbyPlayerStatus,
  PlayerConnectionStatus,
  type Player,
} from '@quizparty/shared';

export type PlayerTone = 'ready' | 'waiting' | 'offline' | 'empty';

export type PlayerSlot =
  | { kind: 'player'; player: Player }
  | { kind: 'empty'; index: number };

export function getPlayerTone(player: Player): PlayerTone {
  if (player.connectionStatus === PlayerConnectionStatus.DISCONNECTED)
    return 'offline';
  if (player.lobbyStatus === LobbyPlayerStatus.READY) return 'ready';
  return 'waiting';
}
