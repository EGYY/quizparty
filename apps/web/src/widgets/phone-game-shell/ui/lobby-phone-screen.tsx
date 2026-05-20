import { getPhoneAvatar, phoneAvatars, PhoneAvatarPicker } from '@entities/player';
import type { Player, RoomSummary } from '@quizparty/shared';
import { MAX_PLAYERS } from '@quizparty/shared';
import { phonePopcornMascotUrl, quizPartyLogoUrl } from '@shared/lib/assets';
import { ArrowLeft, Check, Pencil, Star, Tv, Users } from 'lucide-react';
import { memo } from 'react';
import { LobbyPlayerList } from './lobby-player-list';
import styles from './phone-game-shell.module.scss';
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
    <section className={styles['phone-lobby-screen']}>
      <header className={styles['phone-lobby-hero']}>
        <div className={styles['phone-lobby-actions']}>
          <button className={styles['lobby-icon-button']} type="button" onClick={onLeave}>
            <ArrowLeft size={26} />
          </button>
        </div>
        <img alt="QuizParty" className={styles['phone-lobby-logo']} src={quizPartyLogoUrl} />
        <div className={styles['phone-lobby-code']}>
          <span>Комната</span>
          <strong>{room.roomCode}</strong>
        </div>
        <img alt="" className={styles['phone-lobby-mascot']} src={phonePopcornMascotUrl} />
      </header>

      <section className={styles['phone-lobby-panel']}>
        {error ? (
          <div className={`${styles['phone-error']} ${styles['lobby-error']}`}>
            <span>{error}</span>
            <button type="button" onClick={onReconnect}>
              Повторить
            </button>
          </div>
        ) : null}

        <div className={styles['lobby-profile']}>
          <div className={styles['lobby-profile-avatar']}>
            <img alt="" src={selectedAvatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
          </div>
          <div className={styles['lobby-profile-main']}>
            <div className={styles['lobby-profile-name']}>
              <strong>{nickname || ownPlayer?.nickname || 'Игрок'}</strong>
              <button type="button" onClick={onEditToggle} aria-label="Редактировать профиль">
                <Pencil size={22} />
              </button>
            </div>
            <div className={styles['lobby-score-pill']}>
              <Star size={21} />
              <span>{ownPlayer?.score ?? 0}</span>
            </div>
            <button
              className={
                ownReady
                  ? `${styles['lobby-ready-button']} ${styles.active}`
                  : styles['lobby-ready-button']
              }
              type="button"
              onClick={onReadyChange}
            >
              <Check size={26} />
              {ownReady ? 'Готов к игре' : 'Начать'}
            </button>
            <small className={styles['lobby-ready-bonus']}>
              Ты получишь <b>+10%</b> очков за готовность!
            </small>
          </div>
        </div>

        {isEditingProfile ? (
          <div className={styles['lobby-profile-editor']}>
            <label className={styles['phone-field']}>
              Никнейм
              <input
                maxLength={24}
                value={draftNickname}
                onChange={(event) => onDraftNicknameChange(event.target.value)}
              />
            </label>
            <PhoneAvatarPicker selectedAvatarId={avatarId} onChange={onAvatarChange} />
            <button
              className={styles['lobby-save-button']}
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

        <section className={styles['lobby-players-card']}>
          <h2>
            <Users size={22} />
            Игроки{' '}
            <span>
              {playerCount} / {MAX_PLAYERS}
            </span>
          </h2>
          <LobbyPlayerList ownPlayerId={ownPlayer?.playerId} players={players} />
        </section>

        <section className={styles['lobby-tv-card']}>
          <div className={styles['lobby-tv-icon']}>
            <Tv size={33} />
          </div>
          <div>
            <h2>Ждем старта на TV</h2>
            <p>Когда ведущий начнет игру, вопрос появится здесь!</p>
          </div>
          <div className={styles['lobby-tv-preview']} />
        </section>
      </section>

      <ReactionBar variant="lobby" onSend={onSendReaction} />
      <span
        className={`${styles['phone-lobby-connection']} ${styles[connectionStatus] ?? ''}`}
        role="status"
        aria-live="polite"
      >
        {connectionStatus}
      </span>
    </section>
  );
});
