import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  ClientEvent,
  ServerEvent,
  joinLobbyPayloadSchema,
  reactionPayloadSchema,
  submitAnswerPayloadSchema,
} from '@quizparty/shared';
import type { Server } from 'socket.io';
import {
  WsExceptionFilter,
  WsFallbackExceptionFilter,
} from '../../common/filters/ws-exception.filter';
import { type QuizPartySocket, requireSession } from '../../common/gateways/socket-session';
import { GameRealtimeService } from './game-realtime.service';
import { GamePlayService } from './gameplay.service';
import { LobbyService } from './lobby.service';

@UseFilters(WsExceptionFilter, WsFallbackExceptionFilter)
@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly lobby: LobbyService,
    private readonly gameplay: GamePlayService,
    private readonly realtime: GameRealtimeService,
  ) {}

  afterInit(server: Server): void {
    this.realtime.registerGameServer(server);
  }

  @SubscribeMessage(ClientEvent.JOIN_LOBBY)
  async joinGameRoom(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const parsed = joinLobbyPayloadSchema.parse(payload);
    const { state, playerId, playerToken } = await this.lobby.joinLobby(parsed);
    socket.data.roomCode = state.roomCode;
    socket.data.playerId = playerId;
    await socket.join(state.roomCode);
    socket.emit(ServerEvent.LOBBY_STATE, { ...state, playerId, playerToken });
  }

  @SubscribeMessage(ClientEvent.SUBMIT_ANSWER)
  async submitAnswer(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const { roomCode, playerId } = requireSession(socket);
    const event = await this.gameplay.submitAnswer(
      roomCode,
      playerId,
      submitAnswerPayloadSchema.parse(payload),
    );
    socket.emit(ServerEvent.ANSWER_ACCEPTED, event);
  }

  @SubscribeMessage(ClientEvent.SEND_REACTION)
  async sendReaction(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const { roomCode, playerId } = requireSession(socket);
    const parsed = reactionPayloadSchema.parse(payload);
    await this.lobby.sendReaction(roomCode, playerId, parsed.emoji);
  }

  @SubscribeMessage(ClientEvent.PAUSE_GAME)
  async pauseGame(@ConnectedSocket() socket: QuizPartySocket): Promise<void> {
    const { roomCode, playerId } = requireSession(socket);
    await this.gameplay.pauseGame(roomCode, playerId);
  }

  @SubscribeMessage(ClientEvent.RESUME_GAME)
  async resumeGame(@ConnectedSocket() socket: QuizPartySocket): Promise<void> {
    const { roomCode, playerId } = requireSession(socket);
    await this.gameplay.resumeGame(roomCode, playerId);
  }

  @SubscribeMessage(ClientEvent.END_GAME)
  async endGame(@ConnectedSocket() socket: QuizPartySocket): Promise<void> {
    const { roomCode, playerId } = requireSession(socket);
    await this.gameplay.endGameFromHost(roomCode, playerId);
  }
}
