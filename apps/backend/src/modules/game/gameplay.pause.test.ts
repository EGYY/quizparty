import {
  Difficulty,
  GameMode,
  GamePhase,
  LobbyPlayerStatus,
  MAX_PLAYERS,
  PlayerConnectionStatus,
  ServerEvent,
} from '@quizparty/shared';
import type { LobbyState } from '@quizparty/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RoomStateService } from '../../infrastructure/room-state.service';
import type { GameRealtimeService } from './game-realtime.service';
import type { GameStateService } from './game-state.service';
import type { GameTimersService } from './game-timers.service';
import { GamePlayService } from './gameplay.service';
import type { InternalGameState } from './game.types';

const roomCode = 'QUIZ-123456';
const hostPlayerId = '00000000-0000-4000-8000-000000000001';

function createRoom(): LobbyState {
  return {
    roomCode,
    joinUrl: 'https://quiz.test/join/QUIZ-123456',
    qrVisible: true,
    phase: GamePhase.QUESTION,
    hostPlayerId,
    selectedQuiz: {} as LobbyState['selectedQuiz'],
    settings: {
      quizId: '00000000-0000-4000-8000-000000000101',
      difficulty: Difficulty.MEDIUM,
      mode: GameMode.CLASSIC,
      questionDurationMs: 30_000,
      revealDurationMs: 8_000,
    },
    players: [
      {
        playerId: hostPlayerId,
        nickname: 'Host',
        avatarId: 'avatar-01',
        score: 0,
        streak: 0,
        isReady: true,
        isHost: true,
        joinedAt: '2026-05-20T00:00:00.000Z',
        connectionStatus: PlayerConnectionStatus.CONNECTED,
        lobbyStatus: LobbyPlayerStatus.READY,
      },
    ],
    maxPlayers: MAX_PLAYERS,
  };
}

function createGame(overrides: Partial<InternalGameState> = {}): InternalGameState {
  return {
    roomCode,
    quizId: '00000000-0000-4000-8000-000000000101',
    phase: GamePhase.QUESTION,
    startedAt: 10_000,
    currentRoundIndex: 0,
    totalRounds: 2,
    questions: [],
    answers: {},
    playerStats: {},
    roundStartedAt: 10_000,
    roundEndsAt: 40_000,
    lastActivityAt: 10_000,
    ...overrides,
  };
}

function createService(game: InternalGameState, room = createRoom()) {
  let gameState = game;
  let roomState: LobbyState | null = room;
  const deleteRoomState = vi.fn((() => {
    roomState = null;
    return Promise.resolve();
  }) satisfies RoomStateService['deleteRoomState']);
  const patchGameState = vi.fn(((_roomCode, patcher) => {
    gameState = patcher(gameState);
    return Promise.resolve(gameState);
  }) satisfies GameStateService['patchGameState']);
  const deleteGameState = vi.fn((() =>
    Promise.resolve()) satisfies GameStateService['deleteGameState']);
  const emitGame = vi.fn();
  const emitRoom = vi.fn();
  const scheduleRoundEnd = vi.fn();
  const scheduleTimerTick = vi.fn();
  const roomStateService = {
    getRoomState: vi.fn((() =>
      Promise.resolve(roomState)) satisfies RoomStateService['getRoomState']),
    deleteRoomState,
  } as unknown as RoomStateService;
  const gameStateService = {
    getGameState: vi.fn((() =>
      Promise.resolve(gameState)) satisfies GameStateService['getGameState']),
    patchGameState,
    deleteGameState,
  } as unknown as GameStateService;
  const realtime = {
    emitGame,
    emitRoom,
  } as unknown as GameRealtimeService;
  const timers = {
    registerHandlers: vi.fn(),
    scheduleRoundEnd,
    scheduleTimerTick,
    scheduleNextRoundCountdown: vi.fn(),
    scheduleStartRound: vi.fn(),
    scheduleFinishGame: vi.fn(),
  } as unknown as GameTimersService;

  return {
    gameStateService,
    deleteGameState,
    deleteRoomState,
    emitGame,
    emitRoom,
    realtime,
    roomStateService,
    scheduleRoundEnd,
    scheduleTimerTick,
    service: new GamePlayService(roomStateService, gameStateService, realtime, timers),
    timers,
    get gameState() {
      return gameState;
    },
    get roomState() {
      return roomState;
    },
  };
}

describe('GamePlayService pause/resume/end from host', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(25_000);
  });

  it('pauses an active question and stores remaining time', async () => {
    const ctx = createService(createGame());

    const event = await ctx.service.pauseGame(roomCode, hostPlayerId);

    expect(event).toMatchObject({
      phase: GamePhase.QUESTION,
      remainingMs: 15_000,
      serverTime: 25_000,
    });
    expect(ctx.gameState).toMatchObject({
      isPaused: true,
      pauseRemainingMs: 15_000,
      pausedAt: 25_000,
    });
    expect(ctx.emitRoom).toHaveBeenCalledWith(roomCode, ServerEvent.GAME_PAUSED, event);
  });

  it('resumes a paused question and schedules the round end again', async () => {
    const ctx = createService(
      createGame({
        isPaused: true,
        pauseRemainingMs: 12_000,
        pausedAt: 20_000,
        currentQuestion: {
          id: '00000000-0000-4000-8000-000000000201',
        } as NonNullable<InternalGameState['currentQuestion']>,
      }),
    );

    const event = await ctx.service.resumeGame(roomCode, hostPlayerId);

    expect(event).toMatchObject({
      phase: GamePhase.QUESTION,
      remainingMs: 12_000,
      targetTime: 37_000,
    });
    expect(ctx.gameState.isPaused).toBeUndefined();
    expect(ctx.gameState.roundEndsAt).toBe(37_000);
    expect(ctx.scheduleRoundEnd).toHaveBeenCalledWith(
      roomCode,
      0,
      '00000000-0000-4000-8000-000000000201',
      expect.any(Number),
    );
  });

  it('closes the room when host ends the game', async () => {
    const ctx = createService(createGame());

    const event = await ctx.service.endGameFromHost(roomCode, hostPlayerId);

    expect(event).toMatchObject({
      reason: 'HOST_ENDED_GAME',
      roomCode,
    });
    expect(ctx.emitRoom).toHaveBeenCalledWith(roomCode, ServerEvent.ROOM_CLOSED, event);
    expect(ctx.deleteGameState).toHaveBeenCalledWith(roomCode);
    expect(ctx.deleteRoomState).toHaveBeenCalledWith(roomCode);
  });
});
