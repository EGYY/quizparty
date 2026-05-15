import { phoneAvatars } from '@entities/player/model';
import type { Player, RoomSummary } from '@quizparty/shared';
import { MAX_PLAYERS } from '@quizparty/shared';
import { phonePopcornMascotUrl, quizPartyLogoUrl } from '@shared/lib/assets';
import { ArrowLeft, Check, Pencil, Star, Tv, Users } from 'lucide-react';
import { memo } from 'react';
import { getPhoneAvatar } from '../lib/get-phone-avatar';
import { LobbyPlayerList } from './lobby-player-list';
import { ReactionBar } from './reaction-bar';

export const LobbyPhoneScreen = memo(function LobbyPhoneScreen({
  avatarId,
  connectionStatus,
  draftNickname,
  error,
  isEditingProfile,
  nickname,
  onAvatarChange,
  onDraftNicknameChange,
  onEditToggle,
  onLeave,
  onNicknameChange,
  onReadyChange,
  onReconnect,
  onSendReaction,
  ownPlayer,
  ownReady,
  players,
  room,
}: {
  avatarId: string;
  connectionStatus: string;
  draftNickname: string;
  error: string | undefined;
  isEditingProfile: boolean;
  nickname: string;
  onAvatarChange: (avatarId: string) => void;
  onDraftNicknameChange: (nickname: string) => void;
  onEditToggle: () => void;
  onLeave: () => void;
  onNicknameChange: (nickname: string) => void;
  onReadyChange: () => void;
  onReconnect: () => void;
  onSendReaction: (emoji: string) => void;
  ownPlayer: Player | undefined;
  ownReady: boolean;
  players: Player[];
  room: RoomSummary;
}) {
  const selectedAvatar = getPhoneAvatar(avatarId);
  const playerCount = players.length || room.playerCount;

  return (
    <section className="phone-lobby-screen">
      <header className="phone-lobby-hero">
        <div className="phone-lobby-actions">
          <button className="lobby-icon-button" type="button" onClick={onLeave}>
            <ArrowLeft size={26} />
          </button>
        </div>
        <img alt="QuizParty" className="phone-lobby-logo" src={quizPartyLogoUrl} />
        <div className="phone-lobby-code">
          <span>Комната</span>
          <strong>{room.roomCode}</strong>
        </div>
        <img alt="" className="phone-lobby-mascot" src={phonePopcornMascotUrl} />
      </header>

      <section className="phone-lobby-panel">
        {error ? (
          <div className="phone-error lobby-error">
            <span>{error}</span>
            <button type="button" onClick={onReconnect}>
              Повторить
            </button>
          </div>
        ) : null}

        <div className="lobby-profile">
          <div className="lobby-profile-avatar">
            <img alt="" src={selectedAvatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
          </div>
          <div className="lobby-profile-main">
            <div className="lobby-profile-name">
              <strong>{nickname || ownPlayer?.nickname || 'Игрок'}</strong>
              <button type="button" onClick={onEditToggle} aria-label="Редактировать профиль">
                <Pencil size={22} />
              </button>
            </div>
            <div className="lobby-score-pill">
              <Star size={21} />
              <span>{ownPlayer?.score ?? 0}</span>
            </div>
            <button
              className={ownReady ? 'lobby-ready-button active' : 'lobby-ready-button'}
              type="button"
              onClick={onReadyChange}
            >
              <Check size={26} />
              {ownReady ? 'Готов к игре' : 'Начать'}
            </button>
            <small className="lobby-ready-bonus">
              Ты получишь <b>+10%</b> очков за готовность!
            </small>
          </div>
        </div>

        {isEditingProfile ? (
          <div className="lobby-profile-editor">
            <label className="phone-field">
              Никнейм
              <input
                maxLength={24}
                value={draftNickname}
                onChange={(event) => onDraftNicknameChange(event.target.value)}
              />
            </label>
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
            <button
              className="lobby-save-button"
              type="button"
              onClick={() => {
                onNicknameChange(draftNickname.trim() || nickname);
                onEditToggle();
              }}
            >
              Сохранить
            </button>
          </div>
        ) : null}

        <section className="lobby-players-card">
          <h2>
            <Users size={22} />
            Игроки{' '}
            <span>
              {playerCount} / {MAX_PLAYERS}
            </span>
          </h2>
          <LobbyPlayerList ownPlayerId={ownPlayer?.playerId} players={players} />
        </section>

        <section className="lobby-tv-card">
          <div className="lobby-tv-icon">
            <Tv size={33} />
          </div>
          <div>
            <h2>Ждем старта на TV</h2>
            <p>Когда ведущий начнет игру, вопрос появится здесь!</p>
          </div>
          <div className="lobby-tv-preview" />
        </section>
      </section>

      <ReactionBar variant="lobby" onSend={onSendReaction} />
      <span className={`phone-lobby-connection ${connectionStatus}`}>{connectionStatus}</span>
    </section>
  );
});
