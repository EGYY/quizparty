import { WsException } from '@nestjs/websockets';
import { ErrorCode, ServerEvent } from '@quizparty/shared';
import type { Socket } from 'socket.io';

export type QuizPartySocketData = {
  roomCode?: string;
  playerId?: string;
};

export type QuizPartySocket = Socket<any, any, any, QuizPartySocketData>;

export function requireSession(socket: QuizPartySocket): { roomCode: string; playerId: string } {
  const { roomCode, playerId } = socket.data;
  if (!roomCode || !playerId) {
    throw new WsException({
      code: ErrorCode.UNAUTHORIZED,
      message: 'Join lobby before sending events',
    });
  }
  return { roomCode, playerId };
}

export function emitSocketError(socket: QuizPartySocket, error: unknown): void {
  const payload =
    error instanceof WsException
      ? error.getError()
      : { code: ErrorCode.INTERNAL_ERROR, message: 'Unexpected websocket error' };
  socket.emit(ServerEvent.ERROR, payload);
}
