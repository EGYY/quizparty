import { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { LobbyPlayerStatus } from '@quizparty/shared';
import type { RoomSummary } from '@quizparty/shared';
import { phoneAvatars } from '@entities/player/model';
import { useJoinRoom } from '@features/joinRoom';
import { usePhoneGame } from '@features/phoneGame';
import { quizPartyLogoUrl, phonePopcornMascotUrl } from '@shared/lib/assets';
import { GameStateView } from './ui/game-state-view';
import { LobbyPhoneScreen } from './ui/lobby-phone-screen';
import { ReactionBar } from './ui/reaction-bar';

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
    <main className="phone-shell">
      <section className="phone-join-hero">
        <img alt="QuizParty" className="phone-join-logo" src={quizPartyLogoUrl} />
        <h1>Подключайся и играй вместе с друзьями!</h1>
        <div className="phone-join-tip">Введи код с экрана телевизора и выбери свой аватар!</div>
        <img alt="" className="phone-join-mascot" src={phonePopcornMascotUrl} />
      </section>

      <section className="phone-card join-card">
        <label className="phone-field">
          <span>Код комнаты</span>
          <input
            inputMode="text"
            maxLength={7}
            placeholder="4821"
            value={roomCode.startsWith('QUIZ-') ? roomCode.slice(5) : roomCode}
            onChange={(event) => setRoomCode('QUIZ-' + event.target.value.toUpperCase())}
          />
          <small>Найди код на экране телевизора</small>
        </label>

        <label className="phone-field">
          <span>Твое имя</span>
          <input
            maxLength={24}
            placeholder="Maxim"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
          />
        </label>

        <h2 className="phone-section-title">Выбери аватар</h2>
        <div className="avatar-picker" aria-label="Выбор аватара">
          {phoneAvatars.map((avatar) => (
            <button
              className={`avatar-choice ${avatarId === avatar.id ? 'active' : ''}`}
              key={avatar.id}
              type="button"
              onClick={() => onAvatarChange(avatar.id)}
            >
              <img alt="" src={avatar.imageUrl} />
            </button>
          ))}
        </div>

        <div className="phone-safety">
          <span>🛡</span>
          <div>
            <strong>Безопасно и весело!</strong>
            <small>Твой ник видят только другие игроки</small>
          </div>
          <span>🔒</span>
        </div>

        <button
          className="phone-primary"
          disabled={!canJoin || isPending}
          type="button"
          onClick={onJoin}
        >
          {isPending ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          Подключиться
        </button>
      </section>
    </main>
  );
}

function PhoneGameShell({
  avatarId,
  nickname,
  onAvatarChange,
  onNicknameChange,
  onLeave,
  playerId,
  room,
}: {
  avatarId: string;
  nickname: string;
  onAvatarChange: (avatarId: string) => void;
  onLeave: () => void;
  onNicknameChange: (nickname: string) => void;
  playerId: string;
  room: RoomSummary;
}) {
  const game = usePhoneGame({ avatarId, nickname, playerId, room });
  const { updateProfile } = game;
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    updateProfile({ avatarId, nickname });
  }, [avatarId, nickname, updateProfile]);

  const ownReady = game.ownPlayer?.lobbyStatus === LobbyPlayerStatus.READY;
  const showGameReactions = game.gameState.phase === 'reveal' || game.gameState.phase === 'final';

  if (game.gameState.phase === 'lobby') {
    return (
      <main className="phone-shell phone-shell--lobby">
        <LobbyPhoneScreen
          avatarId={avatarId}
          connectionStatus={game.connectionStatus}
          draftNickname={draftNickname}
          error={game.error ?? undefined}
          isEditingProfile={isEditingProfile}
          nickname={nickname}
          onAvatarChange={onAvatarChange}
          onDraftNicknameChange={setDraftNickname}
          onEditToggle={() => setIsEditingProfile((v) => !v)}
          onLeave={onLeave}
          onNicknameChange={onNicknameChange}
          onReadyChange={() => game.setReady(!ownReady)}
          onReconnect={game.reconnect}
          onSendReaction={game.sendReaction}
          ownPlayer={game.ownPlayer}
          ownReady={ownReady}
          players={game.lobbyState?.players ?? []}
          room={room}
        />
      </main>
    );
  }

  return (
    <main className="phone-shell">
      <section className="phone-controller game-controller-shell">
        <header className="phone-top">
          <div>
            <p className="eyebrow">Комната {room.roomCode}</p>
            <h1>{room.selectedQuiz.title}</h1>
          </div>
          <span className={`phone-signal ${game.connectionStatus}`}>{game.connectionStatus}</span>
        </header>

        {game.error ? (
          <div className="phone-error">
            <span>{game.error}</span>
            <button type="button" onClick={game.reconnect}>
              Повторить
            </button>
          </div>
        ) : null}

        <GameStateView
          avatarId={avatarId}
          gameState={game.gameState}
          nickname={nickname}
          onReadyChange={(ready) => game.setReady(ready)}
          onSubmitAnswer={game.submitAnswer}
          ownPlayer={game.ownPlayer}
          ownReady={ownReady}
          playerId={playerId}
          room={room}
        />

        {showGameReactions ? <ReactionBar onSend={game.sendReaction} /> : null}
      </section>
    </main>
  );
}
