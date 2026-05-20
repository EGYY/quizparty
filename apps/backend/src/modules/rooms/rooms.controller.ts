import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { createRoomRequestSchema } from '@quizparty/shared';
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  LobbyState,
  RoomSummary,
} from '@quizparty/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async createRoom(
    @Body(new ZodValidationPipe(createRoomRequestSchema)) body: CreateRoomRequest,
  ): Promise<CreateRoomResponse> {
    return this.rooms.createRoom(body);
  }

  @Get(':roomCode')
  async getRoomSummary(@Param('roomCode') roomCode: string): Promise<RoomSummary> {
    return this.rooms.getRoomSummary(roomCode);
  }

  @Patch(':roomCode/hide-qr')
  async hideQr(@Param('roomCode') roomCode: string): Promise<LobbyState> {
    return this.rooms.hideQr(roomCode);
  }
}
