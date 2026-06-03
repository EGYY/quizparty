import {
  DEFAULT_AV_CLIP_MS,
  Difficulty,
  ErrorCode,
  GameMode,
  GamePhase,
  LobbyPlayerStatus,
  MAX_PLAYERS,
  MediaType,
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
const secondPlayerId = '00000000-0000-4000-8000-000000000002';

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
  const scheduleMediaLoadTimeout = vi.fn();
  const scheduleRoundEnd = vi.fn();
  const scheduleTimerTick = vi.fn();
  const scheduleNextRoundCountdown = vi.fn();
  const scheduleStartRound = vi.fn();
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
    scheduleMediaLoadTimeout,
    scheduleRoundEnd,
    scheduleTimerTick,
    scheduleNextRoundCountdown,
    scheduleStartRound,
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
    scheduleMediaLoadTimeout,
    scheduleNextRoundCountdown,
    scheduleRoundEnd,
    scheduleStartRound,
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

  it('excludes paused time from reaction response time after the answer window is open', async () => {
    const question = createQuestion();
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
    };
    const ctx = createService(
      createGame({
        currentQuestion: question,
        questions: [question],
        answers: { [question.id]: {} },
        answerWindowOpensAt: 10_000,
        answerWindowOpenedAt: 10_000,
        roundEndsAt: 17_000,
        isPaused: true,
        pausedAt: 10_200,
        pauseRemainingMs: 6_800,
      }),
      room,
    );

    vi.mocked(Date.now).mockReturnValue(15_200);
    await ctx.service.resumeGame(roomCode, hostPlayerId);

    expect(ctx.gameState.answerWindowOpensAt).toBe(15_000);
    expect(ctx.gameState.answerWindowOpenedAt).toBe(15_000);
    expect(ctx.gameState.roundEndsAt).toBe(22_000);

    vi.mocked(Date.now).mockReturnValue(15_500);
    await ctx.service.submitAnswer(roomCode, hostPlayerId, {
      questionId: question.id,
      answerIndex: 1,
      submittedAt: 15_500,
    });

    expect(ctx.gameState.answers[question.id]?.[hostPlayerId]).toMatchObject({
      responseMs: 500,
      answeredAt: 15_500,
    });
  });

  it('starts a reaction round without sending options until the answer window opens', async () => {
    const question = createQuestion(); // no media → answerRevealDelayMs = 5000 + 3000 = 8000
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 0, // ignored by service — computed dynamically
    };
    const ctx = createService(
      createGame({
        questions: [question],
        totalRounds: 1,
      }),
      room,
    );

    await ctx.service.startRound(roomCode, 0);

    // now=25000, answerRevealDelayMs=13000 (10000+3000), questionDurationMs=7000
    expect(ctx.emitGame).toHaveBeenCalledWith(
      roomCode,
      ServerEvent.ROUND_START,
      expect.objectContaining({
        question: expect.not.objectContaining({
          options: expect.any(Array),
        }),
        answerStartTime: 38_000,
        roundEndTime: 45_000,
      }),
    );
    expect(ctx.scheduleAnswerWindowOpen).toHaveBeenCalledWith(roomCode, 0, question.id, 13_000);
    expect(ctx.scheduleRoundEnd).toHaveBeenCalledWith(roomCode, 0, question.id, 20_000);
  });

  it('clears stale answer window state when starting the next reaction round', async () => {
    const firstQuestion = createQuestion();
    const secondQuestion = createQuestion({
      id: '00000000-0000-4000-8000-000000000202',
      questionText: 'Second question?',
    }); // no media → answerRevealDelayMs = 8000
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 0, // ignored by service — computed dynamically
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

    // now=25000, answerRevealDelayMs=13000 (10000+3000), questionDurationMs=7000
    expect(ctx.gameState).toMatchObject({
      currentRoundIndex: 1,
      currentQuestion: secondQuestion,
      answerWindowOpensAt: 38_000,
      roundEndsAt: 45_000,
    });
    expect(ctx.gameState.answerWindowOpenedAt).toBeUndefined();
    expect(ctx.scheduleAnswerWindowOpen).toHaveBeenCalledWith(
      roomCode,
      1,
      secondQuestion.id,
      13_000,
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

  it('awards only the fastest reaction player when their answer is correct', async () => {
    const question = createQuestion();
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 7_000,
    };
    room.players.push({
      playerId: secondPlayerId,
      nickname: 'Second',
      avatarId: 'avatar-02',
      score: 0,
      streak: 0,
      isReady: true,
      isHost: false,
      joinedAt: '2026-05-20T00:00:01.000Z',
      connectionStatus: PlayerConnectionStatus.CONNECTED,
      lobbyStatus: LobbyPlayerStatus.READY,
    });
    const ctx = createService(
      createGame({
        currentQuestion: question,
        questions: [question],
        answers: { [question.id]: {} },
        answerWindowOpensAt: 25_000,
        answerWindowOpenedAt: 25_000,
        roundEndsAt: 32_000,
      }),
      room,
    );

    vi.mocked(Date.now).mockReturnValue(26_000);
    await ctx.service.submitAnswer(roomCode, hostPlayerId, {
      questionId: question.id,
      answerIndex: 1,
      submittedAt: 26_000,
    });
    vi.mocked(Date.now).mockReturnValue(25_500);
    await ctx.service.submitAnswer(roomCode, secondPlayerId, {
      questionId: question.id,
      answerIndex: 1,
      submittedAt: 25_500,
    });
    expect(ctx.roomState?.players.map((player) => player.score)).toEqual([0, 0]);

    vi.mocked(Date.now).mockReturnValue(32_000);
    await ctx.service.endRound(roomCode, 0, question.id);

    const roundEnd = ctx.emitGame.mock.calls.find(
      ([, event]) => event === ServerEvent.ROUND_END,
    )?.[2];
    expect(
      ctx.roomState?.players.find((player) => player.playerId === secondPlayerId),
    ).toMatchObject({
      score: 1,
      streak: 1,
    });
    expect(ctx.roomState?.players.find((player) => player.playerId === hostPlayerId)).toMatchObject(
      {
        score: 0,
        streak: 0,
      },
    );
    expect(roundEnd).toMatchObject({
      mode: GameMode.REACTION,
      reactionWinner: {
        playerId: secondPlayerId,
        responseMs: 500,
        scoreDelta: 1,
      },
    });
    expect(roundEnd.scores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ playerId: hostPlayerId, responseMs: 1000, scoreDelta: 0 }),
        expect.objectContaining({ playerId: secondPlayerId, responseMs: 500, scoreDelta: 1 }),
      ]),
    );
    expect(ctx.gameState.playerStats[secondPlayerId]).toMatchObject({
      correctAnswers: 1,
      bestStreak: 1,
      fastestAnswerMs: 500,
    });
    expect(ctx.gameState.playerStats[hostPlayerId]).toBeUndefined();
  });

  it('awards the fastest correct reaction answer even if an incorrect answer was faster', async () => {
    const question = createQuestion();
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 7_000,
    };
    room.players.push({
      playerId: secondPlayerId,
      nickname: 'Second',
      avatarId: 'avatar-02',
      score: 0,
      streak: 0,
      isReady: true,
      isHost: false,
      joinedAt: '2026-05-20T00:00:01.000Z',
      connectionStatus: PlayerConnectionStatus.CONNECTED,
      lobbyStatus: LobbyPlayerStatus.READY,
    });
    const ctx = createService(
      createGame({
        currentQuestion: question,
        questions: [question],
        answers: { [question.id]: {} },
        answerWindowOpensAt: 25_000,
        answerWindowOpenedAt: 25_000,
        roundEndsAt: 32_000,
      }),
      room,
    );

    vi.mocked(Date.now).mockReturnValue(25_500);
    await ctx.service.submitAnswer(roomCode, secondPlayerId, {
      questionId: question.id,
      answerIndex: 0,
      submittedAt: 25_500,
    });
    vi.mocked(Date.now).mockReturnValue(26_000);
    await ctx.service.submitAnswer(roomCode, hostPlayerId, {
      questionId: question.id,
      answerIndex: 1,
      submittedAt: 26_000,
    });

    vi.mocked(Date.now).mockReturnValue(32_000);
    await ctx.service.endRound(roomCode, 0, question.id);

    const roundEnd = ctx.emitGame.mock.calls.find(
      ([, event]) => event === ServerEvent.ROUND_END,
    )?.[2];
    expect(roundEnd).toMatchObject({
      reactionWinner: {
        playerId: hostPlayerId,
        responseMs: 1000,
        scoreDelta: 1,
      },
    });
    expect(ctx.roomState?.players.find((player) => player.playerId === hostPlayerId)).toMatchObject(
      {
        score: 1,
        streak: 1,
      },
    );
    expect(
      ctx.roomState?.players.find((player) => player.playerId === secondPlayerId),
    ).toMatchObject({
      score: 0,
      streak: 0,
    });
  });

  it('does not pick a reaction winner when nobody answered correctly', async () => {
    const question = createQuestion();
    const room = createRoom();
    room.settings = {
      ...room.settings,
      mode: GameMode.REACTION,
      questionDurationMs: 7_000,
      answerRevealDelayMs: 7_000,
    };
    room.players.push({
      playerId: secondPlayerId,
      nickname: 'Second',
      avatarId: 'avatar-02',
      score: 0,
      streak: 0,
      isReady: true,
      isHost: false,
      joinedAt: '2026-05-20T00:00:01.000Z',
      connectionStatus: PlayerConnectionStatus.CONNECTED,
      lobbyStatus: LobbyPlayerStatus.READY,
    });
    const ctx = createService(
      createGame({
        currentQuestion: question,
        questions: [question],
        answers: { [question.id]: {} },
        answerWindowOpensAt: 25_000,
        answerWindowOpenedAt: 25_000,
        roundEndsAt: 32_000,
      }),
      room,
    );

    vi.mocked(Date.now).mockReturnValue(25_500);
    await ctx.service.submitAnswer(roomCode, secondPlayerId, {
      questionId: question.id,
      answerIndex: 0,
      submittedAt: 25_500,
    });
    vi.mocked(Date.now).mockReturnValue(26_000);
    await ctx.service.submitAnswer(roomCode, hostPlayerId, {
      questionId: question.id,
      answerIndex: 2,
      submittedAt: 26_000,
    });

    vi.mocked(Date.now).mockReturnValue(32_000);
    await ctx.service.endRound(roomCode, 0, question.id);

    const roundEnd = ctx.emitGame.mock.calls.find(
      ([, event]) => event === ServerEvent.ROUND_END,
    )?.[2];
    expect(roundEnd.reactionWinner).toBeUndefined();
    expect(ctx.roomState?.players.map((player) => player.score)).toEqual([0, 0]);
    expect(ctx.gameState.playerStats).toEqual({});
  });

  it('starts the reveal countdown from reveal media clip duration after media is ready', async () => {
    const question = createQuestion({
      revealMedia: {
        url: '/uploads/reveal.mp4',
        type: MediaType.VIDEO,
        startMs: 2_000,
        endMs: 7_000,
      },
    });
    const ctx = createService(
      createGame({
        phase: GamePhase.ANSWER_REVEAL,
        currentQuestion: question,
        questions: [question, createQuestion({ id: '00000000-0000-4000-8000-000000000202' })],
        mediaLoadPending: true,
        totalRounds: 2,
      }),
    );

    await ctx.service.tvMediaReady(roomCode);

    expect(ctx.gameState.revealEndsAt).toBe(30_000);
    expect(ctx.scheduleNextRoundCountdown).toHaveBeenCalledWith(roomCode, 30_000, 0);
    expect(ctx.scheduleStartRound).toHaveBeenCalledWith(roomCode, 1, 5_000);
  });

  it('uses the shared fallback for reveal AV media without clip or file duration', async () => {
    const question = createQuestion({
      revealMedia: {
        url: '/uploads/reveal.mp3',
        type: MediaType.AUDIO,
      },
    });
    const ctx = createService(
      createGame({
        phase: GamePhase.ANSWER_REVEAL,
        currentQuestion: question,
        questions: [question, createQuestion({ id: '00000000-0000-4000-8000-000000000202' })],
        mediaLoadPending: true,
        totalRounds: 2,
      }),
    );

    await ctx.service.tvMediaReady(roomCode);

    expect(ctx.gameState.revealEndsAt).toBe(25_000 + DEFAULT_AV_CLIP_MS);
    expect(ctx.scheduleNextRoundCountdown).toHaveBeenCalledWith(
      roomCode,
      25_000 + DEFAULT_AV_CLIP_MS,
      0,
    );
    expect(ctx.scheduleStartRound).toHaveBeenCalledWith(roomCode, 1, DEFAULT_AV_CLIP_MS);
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
