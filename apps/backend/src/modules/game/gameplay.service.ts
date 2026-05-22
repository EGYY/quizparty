import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  AnswerAcceptedEvent,
  AnswerProgressEvent,
  ErrorCode,
  GAME_MODE_SETTINGS,
  GameEndEvent,
  GamePausedEvent,
  GamePhase,
  GameResumedEvent,
  LeaderboardEntry,
  LobbyState,
  NextRoundCountdownEvent,
  PlayerConnectionStatus,
  REACTION_WINDOW_SECONDS,
  RoundEndEvent,
  RoundStartEvent,
  RoomClosedEvent,
  ServerEvent,
  SubmitAnswerPayload,
  TimerTickEvent,
  calculateScore,
  questionSchema,
  roundQuestionSchema,
} from '@quizparty/shared';
import { RoomStateService } from '../../infrastructure/room-state.service';
import { GameRealtimeService } from './game-realtime.service';
import { GameStateService } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import {
  applyRanks,
  ensureHost,
  ensurePlayer,
  nextPlayerStats,
  normalizeLobbyState,
  wsError,
} from './game.helpers';
import type { InternalGameState, StoredAnswer } from './game.types';

type PausablePhase = GamePhase.QUESTION | GamePhase.ANSWER_REVEAL;

@Injectable()
export class GamePlayService implements OnModuleInit {
  constructor(
    private readonly roomState: RoomStateService,
    private readonly gameState: GameStateService,
    private readonly realtime: GameRealtimeService,
    private readonly timers: GameTimersService,
  ) {}

  onModuleInit(): void {
    this.timers.registerHandlers({
      startRound: (roomCode, roundIndex) => this.startRound(roomCode, roundIndex),
      openAnswerWindow: (roomCode, roundIndex, questionId) =>
        this.openAnswerWindow(roomCode, roundIndex, questionId),
      timerTick: (roomCode, roundIndex, questionId) =>
        this.emitTimerTick(roomCode, roundIndex, questionId),
      endRound: (roomCode, roundIndex, questionId) =>
        this.endRound(roomCode, roundIndex, questionId),
      nextRoundCountdown: (roomCode, nextRoundStartsAt) =>
        this.emitNextRoundCountdown(roomCode, nextRoundStartsAt),
      finishGame: (roomCode) => this.finishGame(roomCode),
      cleanupRoom: (roomCode) => this.cleanupRoom(roomCode),
    });
  }

  async submitAnswer(
    roomCode: string,
    playerId: string,
    payload: SubmitAnswerPayload,
  ): Promise<AnswerAcceptedEvent> {
    const room = await this.getRoomOrThrow(roomCode);
    const player = ensurePlayer(room, playerId);
    const game = await this.getGameOrThrow(roomCode);
    const question = game.currentQuestion;
    const now = Date.now();

    if (game.phase !== GamePhase.QUESTION || !question || question.id !== payload.questionId) {
      throw wsError(ErrorCode.GAME_NOT_STARTED, 'No active question');
    }
    if (game.isPaused) {
      throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game is paused');
    }
    if (now > (game.roundEndsAt ?? 0)) {
      throw wsError(ErrorCode.ANSWER_TOO_LATE, 'Answer deadline has passed');
    }
    if (game.answerWindowOpensAt && now < game.answerWindowOpensAt) {
      throw wsError(ErrorCode.ANSWER_TOO_EARLY, 'Answer window is not open yet');
    }

    if ((game.answers[question.id] ?? {})[playerId]) {
      throw wsError(ErrorCode.ANSWER_ALREADY_SUBMITTED, 'Answer already submitted');
    }

    const answerStartedAt =
      game.answerWindowOpenedAt ?? game.answerWindowOpensAt ?? game.roundStartedAt ?? now;
    const responseMs = Math.max(0, now - answerStartedAt);
    const isCorrect = payload.answerIndex === question.correctIndex;
    const totalSeconds = Math.max(1, Math.ceil(room.settings.questionDurationMs / 1000));
    const remainingSeconds = Math.max(0, Math.ceil(((game.roundEndsAt ?? now) - now) / 1000));
    const scoreDelta = calculateScore(isCorrect, remainingSeconds, totalSeconds, player.streak);
    const answer: StoredAnswer = {
      answerIndex: payload.answerIndex,
      answeredAt: now,
      responseMs,
      isCorrect,
      scoreDelta,
    };

    // Атомарный check-and-set под game-локом: повторный ответ того же игрока
    // и гонка между игроками невозможны (нет потерянных ответов/очков).
    let accepted = false;
    let answerTooEarly = false;
    const patched = await this.gameState.patchGameState(roomCode, (current) => {
      if (current.phase !== GamePhase.QUESTION || current.currentQuestion?.id !== question.id) {
        return current;
      }
      if (current.isPaused) {
        return current;
      }
      if (current.answerWindowOpensAt && now < current.answerWindowOpensAt) {
        answerTooEarly = true;
        return current;
      }
      if (current.answers[question.id]?.[playerId]) {
        return current;
      }
      accepted = true;
      return {
        ...current,
        answers: {
          ...current.answers,
          [question.id]: { ...(current.answers[question.id] ?? {}), [playerId]: answer },
        },
        playerStats: nextPlayerStats(
          current.playerStats,
          playerId,
          answer,
          isCorrect ? player.streak + 1 : 0,
        ),
        lastActivityAt: now,
      };
    });

    if (!patched) {
      throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game not started');
    }
    if (answerTooEarly) {
      throw wsError(ErrorCode.ANSWER_TOO_EARLY, 'Answer window is not open yet');
    }
    if (!accepted) {
      throw wsError(ErrorCode.ANSWER_ALREADY_SUBMITTED, 'Answer already submitted');
    }

    await this.roomState.patchRoomState(roomCode, (current) => ({
      ...current,
      players: current.players.map((currentPlayer) =>
        currentPlayer.playerId === playerId
          ? {
              ...currentPlayer,
              score: currentPlayer.score + scoreDelta,
              streak: isCorrect ? currentPlayer.streak + 1 : 0,
            }
          : currentPlayer,
      ),
    }));

    const progressEvent: AnswerProgressEvent = {
      questionId: payload.questionId,
      answeredCount: Object.keys(patched.answers[question.id] ?? {}).length,
      playerCount: room.players.length,
      serverTime: Date.now(),
    };
    this.realtime.emitGame(roomCode, ServerEvent.ANSWER_PROGRESS, progressEvent);

    return {
      questionId: payload.questionId,
      answerIndex: payload.answerIndex,
      answeredAt: now,
    };
  }

  async pauseGame(roomCode: string, playerId: string): Promise<GamePausedEvent> {
    const room = normalizeLobbyState(await this.getRoomOrThrow(roomCode));
    ensureHost(room, playerId);

    const now = Date.now();
    const patched = await this.gameState.patchGameState(roomCode, (game) => {
      if (!isPausablePhase(game.phase)) {
        throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game cannot be paused now');
      }
      const remainingMs = game.isPaused
        ? (game.pauseRemainingMs ?? 0)
        : getPauseRemainingMs(game, now);
      return {
        ...game,
        isPaused: true,
        pausedAt: game.pausedAt ?? now,
        pauseRemainingMs: remainingMs,
        lastActivityAt: now,
      };
    });

    if (!patched || !isPausablePhase(patched.phase)) {
      throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game cannot be paused now');
    }

    const event: GamePausedEvent = {
      phase: patched.phase,
      remainingMs: patched.pauseRemainingMs ?? 0,
      serverTime: now,
    };
    this.realtime.emitRoom(roomCode, ServerEvent.GAME_PAUSED, event);
    return event;
  }

  async resumeGame(roomCode: string, playerId: string): Promise<GameResumedEvent> {
    const room = normalizeLobbyState(await this.getRoomOrThrow(roomCode));
    ensureHost(room, playerId);

    const now = Date.now();
    let shouldScheduleQuestion = false;
    let shouldScheduleAnswerWindow = false;
    let shouldScheduleReveal = false;
    const patched = await this.gameState.patchGameState(roomCode, (game) => {
      if (!isPausablePhase(game.phase)) {
        throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game cannot be resumed now');
      }

      const remainingMs = game.isPaused
        ? (game.pauseRemainingMs ?? 0)
        : getPauseRemainingMs(game, now);
      const targetTime = now + remainingMs;

      if (!game.isPaused) {
        return game;
      }

      const nextGame = withoutPauseFields({
        ...game,
        lastActivityAt: now,
      });

      if (game.phase === GamePhase.QUESTION) {
        if (isAnswerWindowPending(game)) {
          shouldScheduleAnswerWindow = true;
          return {
            ...nextGame,
            answerWindowOpensAt: targetTime,
            roundEndsAt: targetTime + room.settings.questionDurationMs,
          };
        }
        shouldScheduleQuestion = true;
        return {
          ...nextGame,
          roundEndsAt: targetTime,
        };
      }

      shouldScheduleReveal = true;
      return {
        ...nextGame,
        revealEndsAt: targetTime,
      };
    });

    if (!patched || !isPausablePhase(patched.phase)) {
      throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game cannot be resumed now');
    }

    const targetTime =
      patched.phase === GamePhase.QUESTION
        ? getQuestionTargetTime(patched, now)
        : (patched.revealEndsAt ?? now);
    const event: GameResumedEvent = {
      phase: patched.phase,
      remainingMs: Math.max(0, targetTime - now),
      serverTime: now,
      targetTime,
    };
    this.realtime.emitRoom(roomCode, ServerEvent.GAME_RESUMED, event);

    if (
      (shouldScheduleQuestion || shouldScheduleAnswerWindow) &&
      typeof patched.currentRoundIndex === 'number' &&
      patched.currentQuestion
    ) {
      await this.emitTimerTick(roomCode, patched.currentRoundIndex, patched.currentQuestion.id);
      if (shouldScheduleAnswerWindow && patched.answerWindowOpensAt) {
        await this.timers.scheduleAnswerWindowOpen(
          roomCode,
          patched.currentRoundIndex,
          patched.currentQuestion.id,
          Math.max(0, patched.answerWindowOpensAt - Date.now()),
        );
      }
      await this.timers.scheduleRoundEnd(
        roomCode,
        patched.currentRoundIndex,
        patched.currentQuestion.id,
        Math.max(0, (patched.roundEndsAt ?? targetTime) - Date.now()),
      );
    }

    if (shouldScheduleReveal) {
      const hasNextRound = patched.currentRoundIndex + 1 < patched.totalRounds;
      if (hasNextRound) {
        await this.timers.scheduleNextRoundCountdown(roomCode, targetTime, 0);
        await this.timers.scheduleStartRound(
          roomCode,
          patched.currentRoundIndex + 1,
          Math.max(0, targetTime - Date.now()),
        );
      } else {
        await this.timers.scheduleFinishGame(roomCode, Math.max(0, targetTime - Date.now()));
      }
    }

    return event;
  }

  async endGameFromHost(roomCode: string, playerId: string): Promise<RoomClosedEvent> {
    const room = normalizeLobbyState(await this.getRoomOrThrow(roomCode));
    ensureHost(room, playerId);

    const game = await this.gameState.getGameState(roomCode);
    if (
      game &&
      ![
        GamePhase.STARTING,
        GamePhase.QUESTION,
        GamePhase.ANSWER_REVEAL,
        GamePhase.FINAL_RESULTS,
      ].includes(game.phase)
    ) {
      throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game cannot be ended now');
    }

    const event: RoomClosedEvent = {
      roomCode,
      reason: 'HOST_ENDED_GAME',
      serverTime: Date.now(),
    };
    this.realtime.emitRoom(roomCode, ServerEvent.ROOM_CLOSED, event);
    await this.gameState.deleteGameState(roomCode);
    await this.roomState.deleteRoomState(roomCode);
    return event;
  }

  async startRound(roomCode: string, roundIndex: number): Promise<void> {
    const room = await this.roomState.getRoomState(roomCode);
    if (!room) return; // stale job — room was already cleaned up
    const game = await this.gameState.getGameState(roomCode);
    if (!game) return; // stale job — game state was already cleaned up
    if (game.isPaused) return; // stale job — host paused the game
    const question = game.questions[roundIndex];
    if (!question) return;

    const now = Date.now();
    const answerRevealDelayMs = room.settings.answerRevealDelayMs ?? 0;
    const answerWindowOpensAt = now + answerRevealDelayMs;
    const answerWindowOpenedAt = answerRevealDelayMs > 0 ? undefined : now;
    const roundEndsAt = answerWindowOpensAt + room.settings.questionDurationMs;
    const fullQuestion = questionSchema.parse(question);
    const publicQuestion =
      answerRevealDelayMs > 0
        ? roundQuestionSchema.parse({
            ...fullQuestion,
            options: undefined,
          })
        : fullQuestion;
    const {
      answerWindowOpenedAt: _previousAnswerWindowOpenedAt,
      answerWindowOpensAt: _previousAnswerWindowOpensAt,
      ...gameWithoutAnswerWindow
    } = game;
    const nextGame: InternalGameState = {
      ...gameWithoutAnswerWindow,
      phase: GamePhase.QUESTION,
      currentRoundIndex: roundIndex,
      currentQuestion: question,
      roundStartedAt: now,
      roundEndsAt,
      answerWindowOpensAt,
      ...(typeof answerWindowOpenedAt === 'number' ? { answerWindowOpenedAt } : {}),
      lastActivityAt: now,
      answers: {
        ...game.answers,
        [question.id]: game.answers[question.id] ?? {},
      },
    };

    await this.gameState.setGameState(roomCode, nextGame);
    await this.roomState.patchRoomState(roomCode, (current) => ({
      ...current,
      phase: GamePhase.QUESTION,
    }));

    const event: RoundStartEvent = {
      roundNumber: roundIndex + 1,
      totalRounds: game.totalRounds,
      question: publicQuestion,
      serverTime: now,
      roundEndTime: roundEndsAt,
      answerStartTime: answerWindowOpensAt,
    };

    this.realtime.emitGame(roomCode, ServerEvent.ROUND_START, event);
    await this.emitTimerTick(roomCode, roundIndex, question.id);
    if (answerRevealDelayMs > 0) {
      await this.timers.scheduleAnswerWindowOpen(
        roomCode,
        roundIndex,
        question.id,
        answerRevealDelayMs,
      );
    }
    await this.timers.scheduleRoundEnd(
      roomCode,
      roundIndex,
      question.id,
      answerRevealDelayMs + room.settings.questionDurationMs,
    );
  }

  async openAnswerWindow(roomCode: string, roundIndex: number, questionId: string): Promise<void> {
    const room = await this.roomState.getRoomState(roomCode);
    if (!room) return;
    const game = await this.gameState.getGameState(roomCode);
    if (!game) return;
    if (game.isPaused) return;
    const question = game.currentQuestion;
    if (
      game.phase !== GamePhase.QUESTION ||
      game.currentRoundIndex !== roundIndex ||
      !question ||
      question.id !== questionId ||
      game.answerWindowOpenedAt
    ) {
      return;
    }

    const now = Date.now();
    const patched = await this.gameState.patchGameState(roomCode, (current) => {
      if (
        current.phase !== GamePhase.QUESTION ||
        current.currentRoundIndex !== roundIndex ||
        current.currentQuestion?.id !== questionId ||
        current.isPaused ||
        current.answerWindowOpenedAt
      ) {
        return current;
      }

      return {
        ...current,
        answerWindowOpenedAt: now,
        lastActivityAt: now,
      };
    });

    if (!patched || patched.phase !== GamePhase.QUESTION || !patched.currentQuestion) return;

    this.realtime.emitGame(roomCode, ServerEvent.ANSWER_WINDOW_OPEN, {
      questionId,
      options: patched.currentQuestion.options,
      serverTime: now,
      answerStartTime: patched.answerWindowOpenedAt ?? now,
      roundEndTime: patched.roundEndsAt ?? now,
    });
    await this.emitTimerTick(roomCode, roundIndex, questionId);
  }

  async emitTimerTick(roomCode: string, roundIndex: number, questionId: string): Promise<void> {
    const room = await this.roomState.getRoomState(roomCode);
    if (!room) return;
    const game = await this.gameState.getGameState(roomCode);
    if (!game) return;
    if (game.isPaused) return;

    if (
      game.phase !== GamePhase.QUESTION ||
      game.currentRoundIndex !== roundIndex ||
      game.currentQuestion?.id !== questionId ||
      !game.roundEndsAt
    ) {
      return;
    }

    const now = Date.now();
    const isReading =
      typeof game.answerWindowOpensAt === 'number' &&
      !game.answerWindowOpenedAt &&
      now < game.answerWindowOpensAt;
    const answerWindowOpensAt = game.answerWindowOpensAt;
    const targetTime = isReading && answerWindowOpensAt ? answerWindowOpensAt : game.roundEndsAt;
    const remainingMs = Math.max(0, targetTime - now);
    const totalMs = isReading
      ? Math.max(1, (answerWindowOpensAt ?? now) - (game.roundStartedAt ?? now))
      : room.settings.questionDurationMs;
    const event: TimerTickEvent = {
      remainingSeconds: Math.ceil(remainingMs / 1000),
      totalSeconds: Math.max(1, Math.ceil(totalMs / 1000)),
      serverTime: now,
      stage: isReading ? 'reading' : 'answering',
    };
    this.realtime.emitGame(roomCode, ServerEvent.TIMER_TICK, event);

    if (remainingMs > 0) {
      await this.timers.scheduleTimerTick(
        roomCode,
        roundIndex,
        questionId,
        Math.min(1000, remainingMs),
      );
    }
  }

  async endRound(roomCode: string, roundIndex: number, questionId: string): Promise<void> {
    const room = await this.roomState.getRoomState(roomCode);
    if (!room) return;
    const game = await this.gameState.getGameState(roomCode);
    if (!game) return;
    if (game.isPaused) return;
    const question = game.currentQuestion;
    if (
      game.phase !== GamePhase.QUESTION ||
      game.currentRoundIndex !== roundIndex ||
      !question ||
      question.id !== questionId
    ) {
      return;
    }

    const now = Date.now();
    const revealEndsAt = now + room.settings.revealDurationMs;
    const answers = game.answers[questionId] ?? {};
    const answerStats = [0, 1, 2, 3].map((optionIndex) => {
      const count = Object.values(answers).filter(
        (answer) => answer.answerIndex === optionIndex,
      ).length;
      return {
        optionIndex,
        count,
        percentage: room.players.length ? Math.round((count / room.players.length) * 100) : 0,
      };
    });
    const rankedPlayers = applyRanks(room.players);
    const scores = rankedPlayers.map((player) => {
      const answer = answers[player.playerId];
      return {
        playerId: player.playerId,
        nickname: player.nickname,
        avatarId: player.avatarId,
        score: player.score,
        scoreDelta: answer?.scoreDelta ?? 0,
        streak: player.streak,
        rank: player.rank ?? 1,
        answeredCorrectly: answer?.isCorrect ?? false,
        ...(typeof answer?.answerIndex === 'number'
          ? { selectedAnswerIndex: answer.answerIndex }
          : {}),
      };
    });
    const hasNextRound = roundIndex + 1 < game.totalRounds;
    const nextRoundStartsAt = hasNextRound ? revealEndsAt : undefined;
    const modeSettings = GAME_MODE_SETTINGS[room.settings.mode];

    await this.gameState.setGameState(roomCode, {
      ...game,
      phase: GamePhase.ANSWER_REVEAL,
      revealEndsAt,
      lastActivityAt: now,
    });
    await this.roomState.patchRoomState(roomCode, (current) => ({
      ...current,
      phase: GamePhase.ANSWER_REVEAL,
      players: applyRanks(current.players),
    }));

    const roundEndEvent: RoundEndEvent = {
      questionId,
      correctIndex: question.correctIndex,
      ...(modeSettings.showExplanation && question.explanation
        ? { explanation: question.explanation }
        : {}),
      ...(question.revealMedia ? { revealMedia: question.revealMedia } : {}),
      answerStats,
      scores,
      reactionWindowSeconds: REACTION_WINDOW_SECONDS,
      ...(nextRoundStartsAt ? { nextRoundStartsAt } : {}),
    };
    this.realtime.emitGame(roomCode, ServerEvent.ROUND_END, roundEndEvent);
    this.realtime.emitRoom(roomCode, ServerEvent.REACTION_WINDOW_OPEN, {
      durationSeconds: REACTION_WINDOW_SECONDS,
      closesAt: now + REACTION_WINDOW_SECONDS * 1000,
      serverTime: now,
    });

    if (hasNextRound && nextRoundStartsAt) {
      await this.timers.scheduleNextRoundCountdown(roomCode, nextRoundStartsAt, 0);
      await this.timers.scheduleStartRound(
        roomCode,
        roundIndex + 1,
        room.settings.revealDurationMs,
      );
    } else {
      await this.timers.scheduleFinishGame(roomCode, room.settings.revealDurationMs);
    }
  }

  async emitNextRoundCountdown(roomCode: string, nextRoundStartsAt: number): Promise<void> {
    const game = await this.gameState.getGameState(roomCode);
    if (!game || game.phase !== GamePhase.ANSWER_REVEAL) return;
    if (game.isPaused) return;

    const now = Date.now();
    const remainingMs = Math.max(0, nextRoundStartsAt - now);
    const event: NextRoundCountdownEvent = {
      remainingSeconds: Math.ceil(remainingMs / 1000),
      nextRoundStartsAt,
      serverTime: now,
    };
    this.realtime.emitGame(roomCode, ServerEvent.NEXT_ROUND_COUNTDOWN, event);

    if (remainingMs > 0) {
      await this.timers.scheduleNextRoundCountdown(
        roomCode,
        nextRoundStartsAt,
        Math.min(1000, remainingMs),
      );
    }
  }

  async finishGame(roomCode: string): Promise<void> {
    const room = await this.roomState.getRoomState(roomCode);
    if (!room) return;
    const game = await this.gameState.getGameState(roomCode);
    if (!game) return;
    if (game.isPaused) return;
    const rankedPlayers = applyRanks(room.players);
    const leaderboard: LeaderboardEntry[] = rankedPlayers.map((player) => {
      const stats = game.playerStats[player.playerId] ?? {
        correctAnswers: 0,
        bestStreak: 0,
      };
      return {
        playerId: player.playerId,
        nickname: player.nickname,
        avatarId: player.avatarId,
        score: player.score,
        rank: player.rank ?? 1,
        correctAnswers: stats.correctAnswers,
        bestStreak: stats.bestStreak,
        ...(typeof stats.fastestAnswerMs === 'number'
          ? { fastestAnswerMs: stats.fastestAnswerMs }
          : {}),
      };
    });

    await this.gameState.setGameState(roomCode, {
      ...game,
      phase: GamePhase.FINAL_RESULTS,
      lastActivityAt: Date.now(),
    });
    await this.roomState.patchRoomState(roomCode, (current) => ({
      ...current,
      phase: GamePhase.FINAL_RESULTS,
      players: applyRanks(current.players),
    }));

    const event: GameEndEvent = { leaderboard, canRestart: true };
    this.realtime.emitGame(roomCode, ServerEvent.GAME_END, event);
  }

  async cleanupRoom(roomCode: string): Promise<void> {
    const room = await this.roomState.getRoomState(roomCode);
    if (!room) {
      await this.gameState.deleteGameState(roomCode);
      return;
    }

    const hasConnectedPlayers = room.players.some(
      (player) => player.connectionStatus === PlayerConnectionStatus.CONNECTED,
    );
    if (hasConnectedPlayers) return;

    await this.gameState.deleteGameState(roomCode);
    await this.roomState.deleteRoomState(roomCode);
  }

  private async getRoomOrThrow(roomCode: string): Promise<LobbyState> {
    const state = await this.roomState.getRoomState(roomCode);
    if (!state) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    return state;
  }

  private async getGameOrThrow(roomCode: string): Promise<InternalGameState> {
    const state = await this.gameState.getGameState(roomCode);
    if (!state) throw wsError(ErrorCode.GAME_NOT_STARTED, 'Game not started');
    return state;
  }
}

function isPausablePhase(phase: GamePhase): phase is PausablePhase {
  return phase === GamePhase.QUESTION || phase === GamePhase.ANSWER_REVEAL;
}

function getPauseRemainingMs(game: InternalGameState, now: number): number {
  if (game.phase === GamePhase.QUESTION) {
    return Math.max(0, getQuestionTargetTime(game, now) - now);
  }
  if (game.phase === GamePhase.ANSWER_REVEAL) {
    return Math.max(0, (game.revealEndsAt ?? now) - now);
  }
  return 0;
}

function getQuestionTargetTime(game: InternalGameState, now: number): number {
  if (isAnswerWindowPending(game)) {
    return game.answerWindowOpensAt ?? now;
  }
  return game.roundEndsAt ?? now;
}

function isAnswerWindowPending(game: InternalGameState): boolean {
  return (
    game.phase === GamePhase.QUESTION &&
    typeof game.answerWindowOpensAt === 'number' &&
    !game.answerWindowOpenedAt
  );
}

function withoutPauseFields(game: InternalGameState): InternalGameState {
  const {
    isPaused: _isPaused,
    pausedAt: _pausedAt,
    pauseRemainingMs: _pauseRemainingMs,
    ...next
  } = game;
  return next;
}
