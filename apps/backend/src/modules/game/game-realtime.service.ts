import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class GameRealtimeService {
  private lobbyServer?: Server;
  private gameServer?: Server;

  registerLobbyServer(server: Server): void {
    this.lobbyServer = server;
  }

  registerGameServer(server: Server): void {
    this.gameServer = server;
  }

  emitLobby(roomCode: string, event: string, payload?: unknown): void {
    this.lobbyServer?.to(roomCode).emit(event, payload);
  }

  emitGame(roomCode: string, event: string, payload?: unknown): void {
    this.gameServer?.to(roomCode).emit(event, payload);
  }

  emitRoom(roomCode: string, event: string, payload?: unknown): void {
    this.emitLobby(roomCode, event, payload);
    this.emitGame(roomCode, event, payload);
  }
}
