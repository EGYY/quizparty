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
  type QuizPartySocket,
  emitSocketError,
  requireSession,
} from '../../common/gateways/socket-session';
import { GameRealtimeService } from './game-realtime.service';
import { GamePlayService } from './gameplay.service';
import { LobbyService } from './lobby.service';

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

  @SubscribeMessage(ClientEvent.SUBMIT_ANSWER)
  async submitAnswer(
    @ConnectedSocket() socket: QuizPartySocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const { roomCode, playerId } = requireSession(socket);
      const event = await this.gameplay.submitAnswer(
        roomCode,
        playerId,
        submitAnswerPayloadSchema.parse(payload),
      );
      socket.emit(ServerEvent.ANSWER_ACCEPTED, event);
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
}
