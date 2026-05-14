import type { RoomSummary } from '@quizparty/shared';
import { http } from './http';

export async function getRoomSummary(roomCode: string): Promise<RoomSummary> {
  const { data } = await http.get<RoomSummary>(`/rooms/${roomCode.trim().toUpperCase()}`);
  return data;
}
