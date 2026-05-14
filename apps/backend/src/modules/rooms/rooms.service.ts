import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateRoomRequest,
  CreateRoomResponse,
  GamePhase,
  LobbyState,
  MAX_PLAYERS,
  RoomSummary,
  createRoomResponseSchema,
  deriveRoomSettings,
  lobbyStateSchema,
} from '@quizparty/shared';
import { RoomStateService } from '../../infrastructure/room-state.service';
import { mapQuizCard } from '../quizzes/quiz.mapper';
import { QuizzesService } from '../quizzes/quizzes.service';
import { createRoomCode } from './room-code';

@Injectable()
export class RoomsService {
  constructor(
    private readonly config: ConfigService,
    private readonly roomState: RoomStateService,
    private readonly quizzes: QuizzesService,
  ) {}

  async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    const quiz = await this.quizzes.getApprovedQuizForRoom(request.quizId);
    const roomCode = await this.createUniqueRoomCode();
    const joinBaseUrl = this.config
      .get<string>('TV_JOIN_BASE_URL', 'http://localhost:5173/join')
      .replace(/\/$/, '');
    const settings = deriveRoomSettings(request.quizId, request.difficulty, request.mode);
    const joinUrl = `${joinBaseUrl}/${encodeURIComponent(roomCode)}`;

    const lobbyState: LobbyState = lobbyStateSchema.parse({
      roomCode,
      joinUrl,
      qrVisible: true,
      phase: GamePhase.LOBBY,
      selectedQuiz: mapQuizCard(quiz),
      settings,
      players: [],
      maxPlayers: MAX_PLAYERS,
    });

    await this.roomState.setRoomState(roomCode, lobbyState);

    return createRoomResponseSchema.parse({
      roomCode,
      joinUrl,
      settings,
    });
  }

  async getRoomSummary(roomCode: string): Promise<RoomSummary> {
    const state = await this.roomState.getRoomState(roomCode);
    if (!state) throw new NotFoundException('Room not found');

    return {
      roomCode: state.roomCode,
      joinUrl: state.joinUrl,
      phase: state.phase,
      playerCount: new Set(state.players.map((player) => player.playerId)).size,
      maxPlayers: MAX_PLAYERS,
      selectedQuiz: state.selectedQuiz,
      settings: state.settings,
    };
  }

  async hideQr(roomCode: string): Promise<LobbyState> {
    const next = await this.roomState.patchRoomState(roomCode, (state) => ({
      ...state,
      qrVisible: false,
    }));

    if (!next) throw new NotFoundException('Room not found');
    return next;
  }

  private async createUniqueRoomCode(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const roomCode = createRoomCode();
      const existing = await this.roomState.getRoomState(roomCode);
      if (!existing) return roomCode;
    }

    return createRoomCode(8);
  }
}
