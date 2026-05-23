import { Check, Pencil, Star } from 'lucide-react';
import { getPhoneAvatar, phoneAvatars, PhoneAvatarPicker } from '@entities/player';
import type { Player } from '@quizparty/shared';
import styles from './lobby-profile-card.module.scss';

export function LobbyProfileCard({
  avatarId,
  draftNickname,
  isEditingProfile,
  nickname,
  onAvatarChange,
  onDraftNicknameChange,
  onEditToggle,
  onNicknameChange,
  onReadyChange,
  ownPlayer,
  ownReady,
}: {
  avatarId: string;
  draftNickname: string;
  isEditingProfile: boolean;
  nickname: string;
  onAvatarChange: (avatarId: string) => void;
  onDraftNicknameChange: (nickname: string) => void;
  onEditToggle: () => void;
  onNicknameChange: (nickname: string) => void;
  onReadyChange: () => void;
  ownPlayer: Player | undefined;
  ownReady: boolean;
}) {
  const selectedAvatar = getPhoneAvatar(avatarId);

  return (
    <>
      <div className={styles['lobby-profile']}>
        <div className={styles['lobby-profile-avatar']}>
          <img alt="" src={selectedAvatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
        </div>
        <div className={styles['lobby-profile-main']}>
          <div className={styles['lobby-profile-name']}>
            <strong>{nickname || ownPlayer?.nickname || 'Игрок'}</strong>
            <button type="button" aria-label="Редактировать профиль" onClick={onEditToggle}>
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
    </>
  );
}
