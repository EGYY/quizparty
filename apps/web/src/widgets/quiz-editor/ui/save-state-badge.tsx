import type { SaveState } from '@entities/quiz';
import styles from './quiz-editor.module.scss';

export function SaveStateBadge({ state }: { state: SaveState }) {
  const text = {
    idle: 'Готово',
    dirty: 'Изменения',
    saving: 'Сохранение…',
    saved: 'Сохранено',
    error: 'Ошибка',
  }[state];
  return <span className={`${styles.saveState} ${styles[state]}`}>{text}</span>;
}
