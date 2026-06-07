import { memo } from 'react';
import { phoneAvatars } from '../model';
import styles from './phone-avatar-picker.module.scss';

export const PhoneAvatarPicker = memo(function PhoneAvatarPicker({
  compact,
  selectedAvatarId,
  onChange,
}: {
  compact?: boolean;
  selectedAvatarId: string;
  onChange: (avatarId: string) => void;
}) {
  return (
    <div
      role="group"
      className={`${styles.picker}${compact ? ` ${styles.compact}` : ''}`}
      aria-label="Выбор аватара"
    >
      {phoneAvatars.map((avatar) => (
        <button
          aria-label={avatar.label}
          className={`${styles.choice}${selectedAvatarId === avatar.id ? ` ${styles.active}` : ''}`}
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
        >
          <img alt="" src={avatar.imageUrl} width={256} height={256} />
        </button>
      ))}
    </div>
  );
});
