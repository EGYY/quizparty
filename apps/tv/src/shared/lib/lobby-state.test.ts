import {
  Difficulty,
  GameMode,
  GamePhase,
  LobbyPlayerStatus,
  MAX_PLAYERS,
  PlayerConnectionStatus,
  QuizCategory,
} from '@quizparty/shared';
import type { LobbyState, Player } from '@quizparty/shared';
import { dedupeLobbyStatePlayers } from './lobby-state';

const player = (playerId: string, overrides: Partial<Player> = {}): Player => ({
  playerId,
  nickname: 'Player',
  avatarId: 'avatar-01',
  score: 0,
  streak: 0,
  isReady: false,
  isHost: false,
  joinedAt: '2026-05-20T00:00:00.000Z',
  connectionStatus: PlayerConnectionStatus.CONNECTED,
  lobbyStatus: LobbyPlayerStatus.WAITING,
  ...overrides,
});

const lobbyState = (players: Player[]): LobbyState =>
  ({
    roomCode: 'QUIZ-123456',
    joinUrl: 'https://tv.test/join/QUIZ-123456',
    qrVisible: true,
    phase: GamePhase.LOBBY,
    selectedQuiz: {
      id: '00000000-0000-4000-8000-000000000001',
      title: 'Music quiz',
      description: 'Demo quiz',
      category: QuizCategory.MUSIC,
      difficulty: Difficulty.MEDIUM,
      questionCount: 10,
    },
    settings: {
      quizId: '00000000-0000-4000-8000-000000000001',
      difficulty: Difficulty.MEDIUM,
      mode: GameMode.CLASSIC,
      questionDurationMs: 30_000,
      revealDurationMs: 8_000,
    },
    players,
    maxPlayers: MAX_PLAYERS,
  }) as LobbyState;

describe('dedupeLobbyStatePlayers', () => {
  it('keeps first player position and merges later duplicate payloads', () => {
    const first = player('player-1', {
      nickname: 'Old name',
      score: 10,
      lobbyStatus: LobbyPlayerStatus.WAITING,
    });
    const second = player('player-2', { nickname: 'Second' });
    const duplicate = player('player-1', {
      nickname: 'New name',
      score: 25,
      lobbyStatus: LobbyPlayerStatus.READY,
    });

    const result = dedupeLobbyStatePlayers(
      lobbyState([first, second, duplicate]),
    );

    expect(result.players.map(item => item.playerId)).toEqual([
      'player-1',
      'player-2',
    ]);
    expect(result.players[0]).toMatchObject({
      playerId: 'player-1',
      nickname: 'New name',
      score: 25,
      lobbyStatus: LobbyPlayerStatus.READY,
    });
  });

  it('returns a new state object without mutating the original players array', () => {
    const originalPlayers = [
      player('player-1', { nickname: 'First' }),
      player('player-1', { nickname: 'Latest' }),
    ];
    const state = lobbyState(originalPlayers);

    const result = dedupeLobbyStatePlayers(state);

    expect(result).not.toBe(state);
    expect(state.players).toBe(originalPlayers);
    expect(state.players).toHaveLength(2);
    expect(result.players).toHaveLength(1);
  });
});
