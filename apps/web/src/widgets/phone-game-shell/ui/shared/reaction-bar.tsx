import { memo } from 'react';
import { DEFAULT_REACTIONS } from '@quizparty/shared';
import styles from './reaction-bar.module.scss';

export const ReactionBar = memo(function ReactionBar({
  onSend,
  variant,
}: {
  onSend: (emoji: string) => void;
  variant?: 'lobby';
}) {
  return (
    <div
      className={
        variant === 'lobby'
          ? `${styles['reaction-bar']} ${styles['lobby-reactions']}`
          : styles['reaction-bar']
      }
    >
      {DEFAULT_REACTIONS.slice(0, variant === 'lobby' ? 5 : 6).map((emoji) => (
        <button key={emoji} type="button" onClick={() => onSend(emoji)}>
          {emoji}
        </button>
      ))}
    </div>
  );
});
