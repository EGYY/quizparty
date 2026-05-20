import {
  GamePhase,
  MAX_PLAYERS,
  lobbyStateSchema,
  wsErrorEventSchema,
} from '@quizparty/shared';
import type {
  GameStartingEvent,
  LobbyState,
  NextRoundCountdownEvent,
  ReactionWindowEvent,
  RoundEndEvent,
  RoundStartEvent,
} from '@quizparty/shared';
import { dedupeLobbyStatePlayers } from '@shared/lib/lobby-state';
import type { TvQuiz, TvRoom } from '@shared/types/tv';
import type { LobbyLiveStatus } from './types';

export function createInitialLobbyState(
  room: TvRoom,
  quiz: TvQuiz,
): LobbyState {
  return {
    roomCode: room.roomCode,
    joinUrl: room.joinUrl,
    qrVisible: true,
    phase: GamePhase.LOBBY,
    selectedQuiz: quiz,
    settings: room.settings,
    players: [],
    maxPlayers: MAX_PLAYERS,
  };
}

export function readLobbySocketError(
  payload: unknown,
  fallback: string,
): string {
  const parsed = wsErrorEventSchema.safeParse(payload);
  if (parsed.success) return parsed.data.message;
  if (payload instanceof Error) return payload.message;
  return fallback;
}

export function parseLobbyEnvelope(
  payload: unknown,
): { state: LobbyState; playerId?: string; playerToken?: string } | null {
  const parsed = lobbyStateSchema.safeParse(payload);
  if (!parsed.success) return null;
  return {
    state: dedupeLobbyStatePlayers(parsed.data),
    ...(parsed.data.playerId ? { playerId: parsed.data.playerId } : {}),
    ...(parsed.data.playerToken ? { playerToken: parsed.data.playerToken } : {}),
  };
}

export function buildStartingLive(
  event: GameStartingEvent,
): LobbyLiveStatus {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((event.startsAt - Date.now()) / 1000),
  );
  return {
    kind: 'starting',
    label: 'Игра стартует',
    remainingSeconds,
  };
}

export function buildQuestionLive(event: RoundStartEvent): LobbyLiveStatus {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((event.roundEndTime - Date.now()) / 1000),
  );
  return {
    kind: 'question',
    label: `${event.roundNumber} / ${event.totalRounds}`,
    remainingSeconds,
    totalSeconds: Math.max(
      1,
      Math.ceil((event.roundEndTime - event.serverTime) / 1000),
    ),
  };
}

export function buildRevealLive(
  event: RoundEndEvent | ReactionWindowEvent | NextRoundCountdownEvent,
): LobbyLiveStatus {
  const target =
    'nextRoundStartsAt' in event
      ? event.nextRoundStartsAt
      : 'closesAt' in event
        ? event.closesAt
        : event.nextRoundStartsAt;
  return {
    kind: 'reveal',
    label: 'Показываем ответ',
    remainingSeconds: target
      ? Math.max(0, Math.ceil((target - Date.now()) / 1000))
      : 0,
  };
}

