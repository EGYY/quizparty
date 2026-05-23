import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import {
  CreateRoomRequestDto,
  CreateRoomResponseDto,
  LobbyStateDto,
  RoomSummaryDto,
} from './rooms.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @ApiOperation({ summary: 'Create a game room' })
  @ApiBody({ type: CreateRoomRequestDto })
  @ApiResponse({ status: 201, type: CreateRoomResponseDto })
  @ApiResponse({ status: 429, description: 'Rate limited (10/min)' })
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async createRoom(
    @Body(new ZodValidationPipe(createRoomRequestSchema)) body: CreateRoomRequest,
  ): Promise<CreateRoomResponse> {
    return this.rooms.createRoom(body);
  }

  @ApiOperation({ summary: 'Get room summary by room code' })
  @ApiParam({ name: 'roomCode', example: 'ABCD-1234' })
  @ApiResponse({ status: 200, type: RoomSummaryDto })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Get(':roomCode')
  async getRoomSummary(@Param('roomCode') roomCode: string): Promise<RoomSummary> {
    return this.rooms.getRoomSummary(roomCode);
  }

  @ApiOperation({ summary: 'Hide QR code in lobby' })
  @ApiParam({ name: 'roomCode', example: 'ABCD-1234' })
  @ApiResponse({ status: 200, type: LobbyStateDto })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Patch(':roomCode/hide-qr')
  async hideQr(@Param('roomCode') roomCode: string): Promise<LobbyState> {
    return this.rooms.hideQr(roomCode);
  }
}
