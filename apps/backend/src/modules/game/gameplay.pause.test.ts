import {
  Difficulty,
  ErrorCode,
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
import type { InternalGameQuestion } from './game.types';

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
      answerRevealDelayMs: 0,
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

function createQuestion(overrides: Partial<InternalGameQuestion> = {}): InternalGameQuestion {
  return {
    id: '00000000-0000-4000-8000-000000000201',
    quizId: '00000000-0000-4000-8000-000000000101',
    questionText: 'Question?',
    options: ['A', 'B', 'C', 'D'],
    order: 0,
    correctIndex: 1,
    ...overrides,
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
  const setGameState = vi.fn(((_roomCode, next) => {
    gameState = next;
    return Promise.resolve();
  }) satisfies GameStateService['setGameState']);
  const patchRoomState = vi.fn(((_roomCode, patcher) => {
    if (!roomState) return Promise.resolve(null);
    roomState = patcher(roomState);
    return Promise.resolve(roomState);
  }) satisfies RoomStateService['patchRoomState']);
  const deleteGameState = vi.fn((() =>
    Promise.resolve()) satisfies GameStateService['deleteGameState']);
  const emitGame = vi.fn();
  const emitRoom = vi.fn();
  const scheduleAnswerWindowOpen = vi.fn();
  const scheduleRoundEnd = vi.fn();
  const scheduleTimerTick = vi.fn();
  const roomStateService = {
    getRoomState: vi.fn((() =>
      Promise.resolve(roomState)) satisfies RoomStateService['getRoomState']),
    patchRoomState,
    deleteRoomState,
  } as unknown as RoomStateService;
  const gameStateService = {
    getGameState: vi.fn((() =>
      Promise.resolve(gameState)) satisfies GameStateService['getGameState']),
    patchGameState,
    setGameState,
    deleteGameState,
  } as unknown as GameStateService;
  const realtime = {
    emitGame,
    emitRoom,
  } as unknown as GameRealtimeService;
  const timers = {
    registerHandlers: vi.fn(),
    scheduleAnswerWindowOpen,
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
    patchRoomState,
    realtime,
    roomStateService,
    scheduleAnswerWindowOpen,
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

  it('starts a reaction round without sending options until the answer window opens', async () => {
    const question = createQuestion();
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 7_000,
    };
    const ctx = createService(
      createGame({
        questions: [question],
        totalRounds: 1,
      }),
      room,
    );

    await ctx.service.startRound(roomCode, 0);

    expect(ctx.emitGame).toHaveBeenCalledWith(
      roomCode,
      ServerEvent.ROUND_START,
      expect.objectContaining({
        question: expect.not.objectContaining({
          options: expect.any(Array),
        }),
        answerStartTime: 32_000,
        roundEndTime: 39_000,
      }),
    );
    expect(ctx.scheduleAnswerWindowOpen).toHaveBeenCalledWith(roomCode, 0, question.id, 7_000);
    expect(ctx.scheduleRoundEnd).toHaveBeenCalledWith(roomCode, 0, question.id, 14_000);
  });

  it('clears stale answer window state when starting the next reaction round', async () => {
    const firstQuestion = createQuestion();
    const secondQuestion = createQuestion({
      id: '00000000-0000-4000-8000-000000000202',
      questionText: 'Second question?',
    });
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 7_000,
    };
    const ctx = createService(
      createGame({
        currentRoundIndex: 0,
        currentQuestion: firstQuestion,
        questions: [firstQuestion, secondQuestion],
        totalRounds: 2,
        answerWindowOpensAt: 17_000,
        answerWindowOpenedAt: 17_000,
        roundEndsAt: 24_000,
      }),
      room,
    );

    await ctx.service.startRound(roomCode, 1);

    expect(ctx.gameState).toMatchObject({
      currentRoundIndex: 1,
      currentQuestion: secondQuestion,
      answerWindowOpensAt: 32_000,
      roundEndsAt: 39_000,
    });
    expect(ctx.gameState.answerWindowOpenedAt).toBeUndefined();
    expect(ctx.scheduleAnswerWindowOpen).toHaveBeenCalledWith(
      roomCode,
      1,
      secondQuestion.id,
      7_000,
    );
  });

  it('rejects reaction answers before the answer window opens', async () => {
    const question = createQuestion();
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 7_000,
    };
    const ctx = createService(
      createGame({
        currentQuestion: question,
        questions: [question],
        answers: { [question.id]: {} },
        answerWindowOpensAt: 32_000,
        roundEndsAt: 39_000,
      }),
      room,
    );

    let error: unknown;
    try {
      await ctx.service.submitAnswer(roomCode, hostPlayerId, {
        questionId: question.id,
        answerIndex: 1,
        submittedAt: 25_000,
      });
    } catch (caught) {
      error = caught;
    }

    expect((error as { getError(): unknown }).getError()).toMatchObject({
      code: ErrorCode.ANSWER_TOO_EARLY,
    });
  });

  it('opens the reaction answer window and emits options', async () => {
    const question = createQuestion();
    const ctx = createService(
      createGame({
        currentQuestion: question,
        questions: [question],
        answerWindowOpensAt: 25_000,
        roundEndsAt: 32_000,
      }),
    );

    await ctx.service.openAnswerWindow(roomCode, 0, question.id);

    expect(ctx.gameState.answerWindowOpenedAt).toBe(25_000);
    expect(ctx.emitGame).toHaveBeenCalledWith(
      roomCode,
      ServerEvent.ANSWER_WINDOW_OPEN,
      expect.objectContaining({
        questionId: question.id,
        options: question.options,
        answerStartTime: 25_000,
        roundEndTime: 32_000,
      }),
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
