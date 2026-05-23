import type { SaveState } from '@entities/quiz';
import styles from './save-state-badge.module.scss';

export function SaveStateBadge({ state }: { state: SaveState }) {
  const text = {
    idle: 'Готово',
    dirty: 'Изменения',
    saving: 'Сохранение…',
    saved: 'Сохранено',
    error: 'Ошибка',
  }[state];
  return (
    <span className={`${styles.saveState} ${styles[state]}`} role="status" aria-live="polite">
      {text}
    </span>
  );
}
