import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { roomSummarySchema } from '@quizparty/shared';
import type { RoomSummary } from '@quizparty/shared';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  clearLastRoom,
  getOrCreatePlayerId,
  phoneAvatars,
  readLastRoom,
  readStoredPhoneProfile,
  saveLastRoom,
  saveStoredPhoneProfile,
} from '@entities/player';
import { getRoomSummary } from '@entities/room';
import { useToastStore } from '@shared/ui/toast';

const fallbackAvatarId = phoneAvatars[0]?.id ?? 'avatar-1';
const storedProfile = readStoredPhoneProfile() ?? {
  avatarId: fallbackAvatarId,
  nickname: '',
};

const safeDefaultAvatarId = phoneAvatars.some((a) => a.id === storedProfile.avatarId)
  ? storedProfile.avatarId
  : fallbackAvatarId;

function normalizeRoomCode(value?: string | null): string {
  return value?.trim().toUpperCase() ?? '';
}

function getJoinPath(roomCode: string): string {
  return `/join/${encodeURIComponent(roomCode)}`;
}

export function useJoinRoom() {
  const navigate = useNavigate();
  const notify = useToastStore((state) => state.notify);
  const params = useParams<{ roomCode?: string }>();
  const [searchParams] = useSearchParams();
  const routeRoomCode = normalizeRoomCode(params.roomCode ?? searchParams.get('room'));
  const leavingRef = useRef(false);
  const [room, setRoom] = useState<RoomSummary | undefined>(() => {
    if (!routeRoomCode) return undefined;
    const parsed = roomSummarySchema.safeParse(readLastRoom());
    if (parsed.success && normalizeRoomCode(parsed.data.roomCode) === routeRoomCode) {
      return parsed.data;
    }
    return undefined;
  });
  const [roomCode, setRoomCodeState] = useState(routeRoomCode);
  const [nickname, setNickname] = useState(storedProfile.nickname);
  const [avatarId, setAvatarId] = useState(safeDefaultAvatarId);
  const playerId = useMemo(() => getOrCreatePlayerId(), []);

  const { isPending, mutate: joinRoom } = useMutation({
    mutationFn: getRoomSummary,
    onSuccess: (summary) => {
      saveStoredPhoneProfile({ avatarId, nickname });
      saveLastRoom(summary);
      setRoom(summary);
      setRoomCodeState(summary.roomCode);
      void navigate(getJoinPath(summary.roomCode), { replace: true });
      notify({
        tone: 'success',
        title: 'Комната найдена',
        message: `Подключаемся к ${summary.roomCode}`,
      });
    },
    onError: () =>
      notify({
        tone: 'error',
        title: 'Комната не найдена',
        message: 'Проверьте код на TV и попробуйте снова.',
      }),
  });

  const canJoin = roomCode.trim().length >= 4 && nickname.trim().length >= 2;

  useEffect(() => {
    if (!routeRoomCode || leavingRef.current) return;
    setRoomCodeState(routeRoomCode);
    if (room?.roomCode === routeRoomCode || isPending) return;
    if (nickname.trim().length < 2) return;
    joinRoom(routeRoomCode);
  }, [isPending, joinRoom, nickname, room?.roomCode, routeRoomCode]);

  const onJoin = useCallback(() => {
    if (!canJoin) return;
    joinRoom(roomCode.trim().toUpperCase());
  }, [canJoin, joinRoom, roomCode]);

  const onAvatarChange = useCallback(
    (nextId: string) => {
      setAvatarId(nextId);
      saveStoredPhoneProfile({ avatarId: nextId, nickname });
    },
    [nickname],
  );

  const onNicknameChange = useCallback(
    (next: string) => {
      setNickname(next);
      saveStoredPhoneProfile({ avatarId, nickname: next });
    },
    [avatarId],
  );

  const onLeave = useCallback(() => {
    leavingRef.current = true;
    clearLastRoom();
    setRoom(undefined);
    void navigate('/', { replace: true });
  }, [navigate]);

  const setRoomCode = useCallback((next: string) => {
    setRoomCodeState(normalizeRoomCode(next));
  }, []);

  return {
    avatarId,
    canJoin,
    isPending,
    nickname,
    onAvatarChange,
    onJoin,
    onLeave,
    onNicknameChange,
    playerId,
    room,
    roomCode,
    setRoomCode,
  };
}
