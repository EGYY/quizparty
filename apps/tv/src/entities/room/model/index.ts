import type { LobbyState } from '@quizparty/shared';
import { dedupeLobbyStatePlayers } from '@shared/lib/lobby-state';
import type { TvRoom } from '@shared/types/tv';

export { dedupeLobbyStatePlayers };
export type { TvRoom };

export type TvLobbyState = LobbyState;

