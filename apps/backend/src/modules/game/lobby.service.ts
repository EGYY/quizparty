import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_REACTIONS,
  ErrorCode,
  GamePhase,
  GameStartingEvent,
  JoinLobbyPayload,
  LobbyPlayerStatus,
  LobbyState,
  MAX_PLAYERS,
  Player,
  PlayerConnectionStatus,
  REACTION_RATE_LIMIT,
  ReactionEvent,
  ServerEvent,
  SetPlayerInfoPayload,
  SetReadyPayload,
} from '@quizparty/shared';
import { randomUUID } from 'node:crypto';
import { QuizzesService } from '../quizzes/quizzes.service';
import { RedisService } from '../../infrastructure/redis.service';
import { RoomStateService } from '../../infrastructure/room-state.service';
import { GameRealtimeService } from './game-realtime.service';
import { GameStateService } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import {
  ensureHost,
  ensurePlayer,
  mapQuestion,
  normalizeLobbyState,
  shuffleArray,
  wsError,
} from './game.helpers';
import type { InternalGameState, PlayerGameStats, RoomPatchResult } from './game.types';
import { PlayerTokenService } from './player-token.service';

const GAME_START_COUNTDOWN_SECONDS = 3;
const ROOM_CLEANUP_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name);

  constructor(
    private readonly quizzes: QuizzesService,
    private readonly redis: RedisService,
    private readonly roomState: RoomStateService,
    private readonly gameState: GameStateService,
    private readonly realtime: GameRealtimeService,
    private readonly timers: GameTimersService,
    private readonly playerTokens: PlayerTokenService,
  ) {}

  async joinLobby(
    payload: JoinLobbyPayload,
  ): Promise<{ state: LobbyState; playerId: string; playerToken: string }> {
    const roomCode = payload.roomCode.toUpperCase();
    await this.getRoomOrThrow(roomCode);

    // Если клиент предъявил подписанный сервером токен — верифицируем; иначе
    // позже под локом проверим, не пытается ли он перехватить чужой playerId.
    let trustedFromToken = false;
    if (payload.playerToken) {
      if (!payload.playerId) {
        throw wsError(ErrorCode.UNAUTHORIZED, 'Player token requires player id');
      }
      const verification = this.playerTokens.verify(payload.playerToken, {
        playerId: payload.playerId,
        roomCode,
      });
      if (!verification.ok) {
        throw wsError(ErrorCode.UNAUTHORIZED, 'Invalid player token');
      }
      trustedFromToken = true;
    }

    const playerId = payload.playerId ?? randomUUID();

    const joinedAt = new Date().toISOString();
    const next = await this.roomState.patchRoomState(roomCode, (state) => {
      const normalized = normalizeLobbyState(state);
      const existingPlayer = normalized.players.find((player) => player.playerId === playerId);

      // Анти-спуфинг под локом: повторный захват известного playerId без токена.
      if (existingPlayer && !trustedFromToken) {
        if (this.playerTokens.isStrict) {
          throw wsError(ErrorCode.UNAUTHORIZED, 'Player token required to reclaim this player id');
        }
        this.logger.warn(`legacy token-less re-join: playerId=${playerId} roomCode=${roomCode}`);
      }

      if (!existingPlayer && normalized.players.length >= MAX_PLAYERS) {
        throw wsError(ErrorCode.ROOM_FULL, 'Room is full');
      }

      const hasHost = Boolean(normalized.hostPlayerId);
      const players = existingPlayer
        ? normalized.players.map((player) =>
            player.playerId === playerId
              ? {
                  ...player,
                  nickname: payload.nickname,
                  avatarId: payload.avatarId,
                  connectionStatus: PlayerConnectionStatus.CONNECTED,
                  lobbyStatus: player.isReady ? LobbyPlayerStatus.READY : LobbyPlayerStatus.WAITING,
                }
              : player,
          )
        : [
            ...normalized.players,
            {
              playerId,
              nickname: payload.nickname,
              avatarId: payload.avatarId,
              score: 0,
              streak: 0,
              isReady: false,
              isHost: !hasHost && normalized.players.length === 0,
              joinedAt,
              connectionStatus: PlayerConnectionStatus.CONNECTED,
              lobbyStatus: LobbyPlayerStatus.WAITING,
            } satisfies Player,
          ];

      const hostPlayerId = normalized.hostPlayerId ?? players[0]?.playerId;
      const { hostPlayerId: _previousHostPlayerId, ...stateWithoutHost } = normalized;

      return {
        ...stateWithoutHost,
        ...(hostPlayerId ? { hostPlayerId } : {}),
        players: players.map((player) => ({
          ...player,
          isHost: player.playerId === hostPlayerId,
        })),
      };
    });

    if (!next) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    this.realtime.emitLobby(roomCode, ServerEvent.PLAYER_JOINED, next);

    const playerToken = this.playerTokens.sign(playerId, roomCode);
    return { state: next, playerId, playerToken };
  }

  async disconnectPlayer(roomCode: string, playerId: string): Promise<RoomPatchResult | null> {
    const next = await this.roomState.patchRoomState(roomCode, (state) => {
      const normalized = normalizeLobbyState(state);
      const players = normalized.players.map((player) =>
        player.playerId === playerId
          ? {
              ...player,
              isReady: false,
              connectionStatus: PlayerConnectionStatus.DISCONNECTED,
              lobbyStatus: LobbyPlayerStatus.DISCONNECTED,
            }
          : player,
      );
      const disconnectedHost = normalized.hostPlayerId === playerId;
      const nextHost = disconnectedHost
        ? players.find((player) => player.connectionStatus === PlayerConnectionStatus.CONNECTED)
        : players.find((player) => player.playerId === normalized.hostPlayerId);
      const hostPlayerId = nextHost?.playerId;
      const { hostPlayerId: _previousHostPlayerId, ...stateWithoutHost } = normalized;

      return {
        ...stateWithoutHost,
        ...(hostPlayerId ? { hostPlayerId } : {}),
        players: players.map((player) => ({
          ...player,
          isHost: player.playerId === hostPlayerId,
        })),
      };
    });

    if (!next) return null;

    const host = next.players.find((player) => player.isHost);
    const shouldScheduleCleanup = next.players.every(
      (player) => player.connectionStatus === PlayerConnectionStatus.DISCONNECTED,
    );
    const hostTransfer =
      host && host.playerId !== playerId
        ? { newHostId: host.playerId, newHostNickname: host.nickname }
        : undefined;

    if (shouldScheduleCleanup) {
      await this.timers.scheduleRoomCleanup(roomCode, ROOM_CLEANUP_DELAY_MS);
    }

    return {
      state: next,
      ...(hostTransfer ? { hostTransfer } : {}),
      shouldScheduleCleanup,
    };
  }

  async setPlayerInfo(
    roomCode: string,
    playerId: string,
    payload: SetPlayerInfoPayload,
  ): Promise<LobbyState> {
    const next = await this.roomState.patchRoomState(roomCode, (state) => {
      const normalized = normalizeLobbyState(state);
      return {
        ...normalized,
        players: normalized.players.map((player) =>
          player.playerId === playerId
            ? { ...player, nickname: payload.nickname, avatarId: payload.avatarId }
            : player,
        ),
      };
    });

    if (!next) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    ensurePlayer(next, playerId);
    this.realtime.emitLobby(roomCode, ServerEvent.PLAYER_UPDATED, next);
    return next;
  }

  async setReady(
    roomCode: string,
    playerId: string,
    payload: SetReadyPayload,
  ): Promise<LobbyState> {
    const next = await this.roomState.patchRoomState(roomCode, (state) => {
      const normalized = normalizeLobbyState(state);
      return {
        ...normalized,
        players: normalized.players.map((player) =>
          player.playerId === playerId
            ? {
                ...player,
                isReady: payload.ready,
                lobbyStatus: payload.ready ? LobbyPlayerStatus.READY : LobbyPlayerStatus.WAITING,
              }
            : player,
        ),
      };
    });

    if (!next) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    ensurePlayer(next, playerId);
    this.realtime.emitLobby(roomCode, ServerEvent.PLAYER_UPDATED, next);
    return next;
  }

  async sendReaction(roomCode: string, playerId: string, emoji: string): Promise<ReactionEvent> {
    if (!DEFAULT_REACTIONS.includes(emoji as (typeof DEFAULT_REACTIONS)[number])) {
      throw wsError(ErrorCode.VALIDATION_FAILED, 'Unsupported reaction');
    }

    const state = await this.getRoomOrThrow(roomCode);
    ensurePlayer(state, playerId);

    const rateKey = `room:${roomCode}:player:${playerId}:reactions`;
    const count = await this.redis.client.incr(rateKey);
    if (count === 1) await this.redis.client.expire(rateKey, REACTION_RATE_LIMIT.windowSeconds);
    if (count > REACTION_RATE_LIMIT.maxEvents) {
      throw wsError(ErrorCode.REACTION_RATE_LIMITED, 'Too many reactions');
    }

    const reaction: ReactionEvent = {
      id: randomUUID(),
      playerId,
      emoji,
      createdAt: new Date().toISOString(),
    };
    this.realtime.emitRoom(roomCode, ServerEvent.REACTION_RECEIVED, reaction);
    return reaction;
  }

  async hideQr(roomCode: string, playerId: string): Promise<LobbyState> {
    const state = normalizeLobbyState(await this.getRoomOrThrow(roomCode));
    ensureHost(state, playerId);
    const next = await this.roomState.patchRoomState(roomCode, (current) => {
      const normalized = normalizeLobbyState(current);
      return {
        ...normalized,
        qrVisible: false,
      };
    });
    if (!next) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    this.realtime.emitLobby(roomCode, ServerEvent.LOBBY_STATE, next);
    return next;
  }

  async startGame(roomCode: string, playerId: string): Promise<GameStartingEvent> {
    const preState = normalizeLobbyState(await this.getRoomOrThrow(roomCode));
    ensureHost(preState, playerId);

    if (![GamePhase.LOBBY, GamePhase.FINAL_RESULTS].includes(preState.phase)) {
      throw wsError(ErrorCode.GAME_ALREADY_STARTED, 'Game is already running');
    }

    const quiz = await this.quizzes.getApprovedQuizForRoom(preState.settings.quizId);
    if (!quiz.questions.length) {
      throw wsError(ErrorCode.VALIDATION_FAILED, 'Quiz has no questions');
    }

    const now = Date.now();
    const startsAt = now + GAME_START_COUNTDOWN_SECONDS * 1000;

    // Авторитетная проверка фазы и переход — атомарно под room-локом.
    // Параллельный второй startGame увидит фазу STARTING и упадёт здесь.
    const next = await this.roomState.patchRoomState(roomCode, (current) => {
      const normalized = normalizeLobbyState(current);
      if (![GamePhase.LOBBY, GamePhase.FINAL_RESULTS].includes(normalized.phase)) {
        throw wsError(ErrorCode.GAME_ALREADY_STARTED, 'Game is already running');
      }
      return {
        ...normalized,
        phase: GamePhase.STARTING,
        players: normalized.players.map((player) => ({ ...player, score: 0, streak: 0 })),
      };
    });

    if (!next) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');

    const gameState: InternalGameState = {
      roomCode,
      quizId: preState.settings.quizId,
      phase: GamePhase.STARTING,
      startedAt: now,
      currentRoundIndex: -1,
      totalRounds: quiz.questions.length,
      questions: shuffleArray(quiz.questions).map((question) => mapQuestion(question)),
      answers: {},
      playerStats: Object.fromEntries(
        next.players.map((player) => [
          player.playerId,
          { correctAnswers: 0, bestStreak: 0 } satisfies PlayerGameStats,
        ]),
      ),
      lastActivityAt: now,
    };

    await this.gameState.setGameState(roomCode, gameState);
    await this.timers.scheduleStartRound(roomCode, 0, GAME_START_COUNTDOWN_SECONDS * 1000);

    const event: GameStartingEvent = {
      countdownSeconds: GAME_START_COUNTDOWN_SECONDS,
      serverTime: now,
      startsAt,
    };
    this.realtime.emitRoom(roomCode, ServerEvent.GAME_STARTING, event);
    return event;
  }

  private async getRoomOrThrow(roomCode: string): Promise<LobbyState> {
    const state = await this.roomState.getRoomState(roomCode);
    if (!state) throw wsError(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    return state;
  }
}
