import type { RoomSummary } from '@quizparty/shared';
import { http } from '@shared/api/http';

export async function getRoomSummary(roomCode: string): Promise<RoomSummary> {
  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const { data } = await http.get<RoomSummary>(`/rooms/${encodeURIComponent(normalizedRoomCode)}`);
  return data;
}
