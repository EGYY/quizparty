import type { TvQuiz, TvRoom } from '@shared/types/tv';

export type UseLobbyRealtimeParams = {
  quiz: TvQuiz;
  room: TvRoom;
};

export type LobbyConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

export type LobbyLiveStatus =
  | { kind: 'idle'; label: string }
  | { kind: 'starting'; label: string; remainingSeconds: number }
  | {
      kind: 'question';
      label: string;
      remainingSeconds: number;
      totalSeconds: number;
    }
  | { kind: 'reveal'; label: string; remainingSeconds: number }
  | { kind: 'finished'; label: string };
