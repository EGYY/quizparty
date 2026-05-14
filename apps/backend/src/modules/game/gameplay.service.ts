import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  AnswerAcceptedEvent,
  AnswerProgressEvent,
  ErrorCode,
  GAME_MODE_SETTINGS,
  GameEndEvent,
  GamePhase,
  LeaderboardEntry,
  LobbyState,
  NextRoundCountdownEvent,
  PlayerConnectionStatus,
  REACTION_WINDOW_SECONDS,
  RoundEndEvent,
  RoundStartEvent,
  ServerEvent,
  SubmitAnswerPayload,
  TimerTickEvent,
  calculateScore,
  questionSchema,
} from '@quizparty/shared';
import { RoomStateService } from '../../infrastructure/room-state.service';
import { GameRealtimeService } from './game-realtime.service';
import { GameStateService } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import { applyRanks, ensurePlayer, nextPlayerStats, wsError } from './game.helpers';
import type { InternalGameState, StoredAnswer } from './game.types';

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
    if (now > (game.roundEndsAt ?? 0)) {
      throw wsError(ErrorCode.ANSWER_TOO_LATE, 'Answer deadline has passed');
    }

    const questionAnswers = game.answers[question.id] ?? {};
    if (questionAnswers[playerId]) {
      throw wsError(ErrorCode.ANSWER_ALREADY_SUBMITTED, 'Answer already submitted');
    }

    const responseMs = Math.max(0, now - (game.roundStartedAt ?? now));
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

    await this.gameState.patchGameState(roomCode, (current) => ({
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
    }));

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
      answeredCount: Object.keys(questionAnswers).length + 1,
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

  async startRound(roomCode: string, roundIndex: number): Promise<void> {
    const room = await this.getRoomOrThrow(roomCode);
    const game = await this.getGameOrThrow(roomCode);
    const question = game.questions[roundIndex];
    if (!question) return;

    const now = Date.now();
    const roundEndsAt = now + room.settings.questionDurationMs;
    const publicQuestion = questionSchema.parse(question);
    const nextGame: InternalGameState = {
      ...game,
      phase: GamePhase.QUESTION,
      currentRoundIndex: roundIndex,
      currentQuestion: question,
      roundStartedAt: now,
      roundEndsAt,
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
    };

    this.realtime.emitGame(roomCode, ServerEvent.ROUND_START, event);
    await this.emitTimerTick(roomCode, roundIndex, question.id);
    await this.timers.scheduleRoundEnd(
      roomCode,
      roundIndex,
      question.id,
      room.settings.questionDurationMs,
    );
  }

  async emitTimerTick(roomCode: string, roundIndex: number, questionId: string): Promise<void> {
    const room = await this.getRoomOrThrow(roomCode);
    const game = await this.getGameOrThrow(roomCode);

    if (
      game.phase !== GamePhase.QUESTION ||
      game.currentRoundIndex !== roundIndex ||
      game.currentQuestion?.id !== questionId ||
      !game.roundEndsAt
    ) {
      return;
    }

    const now = Date.now();
    const remainingMs = Math.max(0, game.roundEndsAt - now);
    const event: TimerTickEvent = {
      remainingSeconds: Math.ceil(remainingMs / 1000),
      totalSeconds: Math.max(1, Math.ceil(room.settings.questionDurationMs / 1000)),
      serverTime: now,
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
    const room = await this.getRoomOrThrow(roomCode);
    const game = await this.getGameOrThrow(roomCode);
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
    const room = await this.getRoomOrThrow(roomCode);
    const game = await this.getGameOrThrow(roomCode);
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
