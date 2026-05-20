import { JoinRoomScreen, useJoinRoom } from '@features/join-room';
import { PhoneGameShell } from '@widgets/phone-game-shell';

export default function PhoneControllerPage() {
  const {
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
  } = useJoinRoom();

  if (room) {
    return (
      <PhoneGameShell
        avatarId={avatarId}
        nickname={nickname.trim()}
        onAvatarChange={onAvatarChange}
        onLeave={onLeave}
        onNicknameChange={onNicknameChange}
        playerId={playerId}
        room={room}
      />
    );
  }

  return (
    <JoinRoomScreen
      avatarId={avatarId}
      canJoin={canJoin}
      isPending={isPending}
      nickname={nickname}
      roomCode={roomCode}
      onAvatarChange={onAvatarChange}
      onJoin={onJoin}
      onNicknameChange={onNicknameChange}
      setRoomCode={setRoomCode}
    />
  );
}
