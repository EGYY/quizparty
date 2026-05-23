import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { IconButton } from '@shared/ui';
import styles from './question-editor-panel.module.scss';

export function QuestionHeaderControls({
  count,
  index,
  onNavigate,
  onRemove,
}: {
  count: number;
  index: number;
  onNavigate: (index: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className={styles.questionHeader}>
      <div className={styles.questionNav}>
        <IconButton
          disabled={index === 0}
          label="Предыдущий вопрос"
          title="Предыдущий вопрос"
          onClick={() => onNavigate(index - 1)}
        >
          <ChevronLeft size={18} />
        </IconButton>
        <span className={styles.questionCounter}>
          Вопрос {index + 1} / {count}
        </span>
        <IconButton
          disabled={index === count - 1}
          label="Следующий вопрос"
          title="Следующий вопрос"
          onClick={() => onNavigate(index + 1)}
        >
          <ChevronRight size={18} />
        </IconButton>
      </div>
      <IconButton label="Удалить вопрос" tone="danger" title="Удалить вопрос" onClick={onRemove}>
        <Trash2 size={16} />
      </IconButton>
    </div>
  );
}
