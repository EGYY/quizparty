import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
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
  setPlayerInfoPayloadSchema,
  setReadyPayloadSchema,
} from '@quizparty/shared';
import type { Server } from 'socket.io';
import {
  type QuizPartySocket,
  emitSocketError,
  requireSession,
} from '../../common/gateways/socket-session';
import { GameRealtimeService } from './game-realtime.service';
import { LobbyService } from './lobby.service';

@WebSocketGateway({ namespace: 'lobby' })
export class LobbyGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly lobby: LobbyService,
    private readonly realtime: GameRealtimeService,
  ) {}

  afterInit(server: Server): void {
    this.realtime.registerLobbyServer(server);
  }

  async handleDisconnect(socket: QuizPartySocket): Promise<void> {
    const { roomCode, playerId } = socket.data;
    if (!roomCode || !playerId) return;

    const result = await this.lobby.disconnectPlayer(roomCode, playerId);
    if (!result) return;

    this.server.to(roomCode).emit(ServerEvent.PLAYER_LEFT, result.state);
    if (result.hostTransfer) {
      this.server.to(roomCode).emit(ServerEvent.HOST_TRANSFERRED, result.hostTransfer);
    }
  }

  @SubscribeMessage(ClientEvent.JOIN_LOBBY)
  async joinLobby(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const parsed = joinLobbyPayloadSchema.parse(payload);
      const { state, playerId } = await this.lobby.joinLobby(parsed);
      socket.data.roomCode = state.roomCode;
      socket.data.playerId = playerId;
      await socket.join(state.roomCode);
      socket.emit(ServerEvent.LOBBY_STATE, { ...state, playerId });
    } catch (error) {
      emitSocketError(socket, error);
    }
  }

  @SubscribeMessage(ClientEvent.SET_PLAYER_INFO)
  async setPlayerInfo(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const { roomCode, playerId } = requireSession(socket);
      await this.lobby.setPlayerInfo(roomCode, playerId, setPlayerInfoPayloadSchema.parse(payload));
    } catch (error) {
      emitSocketError(socket, error);
    }
  }

  @SubscribeMessage(ClientEvent.SET_READY)
  async setReady(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const { roomCode, playerId } = requireSession(socket);
      await this.lobby.setReady(roomCode, playerId, setReadyPayloadSchema.parse(payload));
    } catch (error) {
      emitSocketError(socket, error);
    }
  }

  @SubscribeMessage(ClientEvent.SEND_REACTION)
  async sendReaction(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const { roomCode, playerId } = requireSession(socket);
      const parsed = reactionPayloadSchema.parse(payload);
      await this.lobby.sendReaction(roomCode, playerId, parsed.emoji);
    } catch (error) {
      emitSocketError(socket, error);
    }
  }

  @SubscribeMessage(ClientEvent.HIDE_QR)
  async hideQr(@ConnectedSocket() socket: QuizPartySocket): Promise<void> {
    try {
      const { roomCode, playerId } = requireSession(socket);
      await this.lobby.hideQr(roomCode, playerId);
    } catch (error) {
      emitSocketError(socket, error);
    }
  }

  @SubscribeMessage(ClientEvent.START_GAME)
  async startGame(@ConnectedSocket() socket: QuizPartySocket): Promise<void> {
    try {
      const { roomCode, playerId } = requireSession(socket);
      await this.lobby.startGame(roomCode, playerId);
    } catch (error) {
      emitSocketError(socket, error);
    }
  }
}
