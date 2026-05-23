import { createZodDto } from 'nestjs-zod';
import {
  createRoomRequestSchema,
  createRoomResponseSchema,
  lobbyStateSchema,
  roomSummarySchema,
} from '@quizparty/shared';

export class CreateRoomRequestDto extends createZodDto(createRoomRequestSchema) {}
export class CreateRoomResponseDto extends createZodDto(createRoomResponseSchema) {}
export class RoomSummaryDto extends createZodDto(roomSummarySchema) {}
export class LobbyStateDto extends createZodDto(lobbyStateSchema) {}
