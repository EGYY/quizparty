import { WsException } from '@nestjs/websockets';
import { ErrorCode, PlayerConnectionStatus } from '@quizparty/shared';
import type { LobbyState, MediaType, Player } from '@quizparty/shared';
import type { InternalGameQuestion, PlayerGameStats, StoredAnswer } from './game.types';

export function wsError(code: ErrorCode, message: string): WsException {
  return new WsException({ code, message });
}

export function ensurePlayer(state: LobbyState, playerId: string): Player {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) throw wsError(ErrorCode.PLAYER_NOT_FOUND, 'Player not found');
  return player;
}

export function ensureHost(state: LobbyState, playerId: string): void {
  const player = ensurePlayer(state, playerId);
  if (!player.isHost) throw wsError(ErrorCode.HOST_ONLY, 'Only host can do this');
}

export function normalizeLobbyState(state: LobbyState): LobbyState {
  const playerOrder: string[] = [];
  const playersById = new Map<string, Player>();

  for (const player of state.players) {
    if (!playersById.has(player.playerId)) playerOrder.push(player.playerId);
    playersById.set(player.playerId, {
      ...playersById.get(player.playerId),
      ...player,
    });
  }

  const players = playerOrder
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => Boolean(player));
  const fallbackHost =
    players.find((player) => player.connectionStatus === PlayerConnectionStatus.CONNECTED) ??
    players[0];
  const hostPlayerId = players.some((player) => player.playerId === state.hostPlayerId)
    ? state.hostPlayerId
    : fallbackHost?.playerId;
  const { hostPlayerId: _staleHostPlayerId, ...stateWithoutHost } = state;

  return {
    ...stateWithoutHost,
    ...(hostPlayerId ? { hostPlayerId } : {}),
    players: players.map((player) => ({
      ...player,
      isHost: player.playerId === hostPlayerId,
    })),
  };
}

export function applyRanks(players: Player[]): Player[] {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const rankByPlayerId = new Map(sorted.map((p, i) => [p.playerId, i + 1]));
  return players.map((p) => ({
    ...p,
    rank: rankByPlayerId.get(p.playerId) ?? players.length,
  }));
}

export function mapQuestion(question: {
  id: string;
  quizId: string;
  questionText: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaAlt?: string | null;
  mediaStartMs?: number | null;
  mediaEndMs?: number | null;
  mediaPosterUrl?: string | null;
  mediaPrompt?: string | null;
  revealMediaUrl?: string | null;
  revealMediaType?: string | null;
  revealMediaAlt?: string | null;
  revealMediaStartMs?: number | null;
  revealMediaEndMs?: number | null;
  revealMediaPosterUrl?: string | null;
  revealMediaPrompt?: string | null;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  order: number;
}): InternalGameQuestion {
  return {
    id: question.id,
    quizId: question.quizId,
    questionText: question.questionText,
    ...(question.mediaUrl && question.mediaType
      ? {
          media: {
            url: question.mediaUrl,
            type: question.mediaType as MediaType,
            ...(question.mediaAlt ? { alt: question.mediaAlt } : {}),
            ...(typeof question.mediaStartMs === 'number'
              ? { startMs: question.mediaStartMs }
              : {}),
            ...(typeof question.mediaEndMs === 'number' ? { endMs: question.mediaEndMs } : {}),
            ...(question.mediaPosterUrl ? { posterUrl: question.mediaPosterUrl } : {}),
            ...(question.mediaPrompt ? { prompt: question.mediaPrompt } : {}),
          },
        }
      : {}),
    ...(question.revealMediaUrl && question.revealMediaType
      ? {
          revealMedia: {
            url: question.revealMediaUrl,
            type: question.revealMediaType as MediaType,
            ...(question.revealMediaAlt ? { alt: question.revealMediaAlt } : {}),
            ...(typeof question.revealMediaStartMs === 'number'
              ? { startMs: question.revealMediaStartMs }
              : {}),
            ...(typeof question.revealMediaEndMs === 'number'
              ? { endMs: question.revealMediaEndMs }
              : {}),
            ...(question.revealMediaPosterUrl ? { posterUrl: question.revealMediaPosterUrl } : {}),
            ...(question.revealMediaPrompt ? { prompt: question.revealMediaPrompt } : {}),
          },
        }
      : {}),
    options: question.options,
    order: question.order,
    correctIndex: question.correctIndex,
    ...(question.explanation ? { explanation: question.explanation } : {}),
  };
}

export function nextPlayerStats(
  stats: Record<string, PlayerGameStats>,
  playerId: string,
  answer: StoredAnswer,
  nextStreak: number,
): Record<string, PlayerGameStats> {
  const current = stats[playerId] ?? { correctAnswers: 0, bestStreak: 0 };
  const correctAnswers = current.correctAnswers + (answer.isCorrect ? 1 : 0);
  const nextBestStreak = Math.max(current.bestStreak, nextStreak);
  const fastestAnswerMs =
    answer.isCorrect && typeof current.fastestAnswerMs === 'number'
      ? Math.min(current.fastestAnswerMs, answer.responseMs)
      : answer.isCorrect
        ? answer.responseMs
        : current.fastestAnswerMs;

  return {
    ...stats,
    [playerId]: {
      correctAnswers,
      bestStreak: nextBestStreak,
      ...(typeof fastestAnswerMs === 'number' ? { fastestAnswerMs } : {}),
    },
  };
}
