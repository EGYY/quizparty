import { GamePhase, PlayerConnectionStatus } from '@quizparty/shared';
import type { LobbyLiveStatus } from '@entities/room';
import type { TvLobbyState } from '@entities/room';

export function getConnectedPlayerCount(state: TvLobbyState): number {
  return state.players.filter(
    player => player.connectionStatus === PlayerConnectionStatus.CONNECTED,
  ).length;
}

export function getLobbyStartLabel({
  isStarting,
  liveStatus,
}: {
  isStarting: boolean;
  liveStatus: LobbyLiveStatus;
}): string {
  if (liveStatus.kind === 'starting')
    return `Старт через ${liveStatus.remainingSeconds}с`;
  if (liveStatus.kind === 'question')
    return `Раунд: ${liveStatus.remainingSeconds}с`;
  if (isStarting) return 'Игра стартует...';
  return '▶  Начать игру';
}

export function getLobbyMascotSpeech(count: number, max: number): string {
  if (count === 0) return 'Ждём первых\nигроков!\nЗови друзей 🎉';
  if (count < Math.min(max, 3)) return `Уже ${count}!\nЗовём ещё\nребят 🚀`;
  if (count < max) return 'Отличная\nкомпания!\nМожно начинать ▶';
  return 'Все на месте!\nЗапускаем\nигру! 🎮';
}

export function getIsLobbyStarting({
  phase,
  liveStatus,
}: {
  phase: TvLobbyState['phase'];
  liveStatus: LobbyLiveStatus;
}): boolean {
  return phase === GamePhase.STARTING || liveStatus.kind === 'starting';
}
