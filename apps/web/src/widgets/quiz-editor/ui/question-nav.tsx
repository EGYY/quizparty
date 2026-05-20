import { memo } from 'react';
import { Plus } from 'lucide-react';
import type { QuizDraft } from '@quizparty/shared';
import { questionErrorCount } from '../lib/compute-errors';
import type { DraftErrors } from '../model/types';
import styles from './quiz-editor.module.scss';

export const QuestionNav = memo(function QuestionNav({
  draft,
  errors,
  selectedIndex,
  showErrors,
  onAdd,
  onSelect,
}: {
  draft: QuizDraft;
  errors: DraftErrors;
  selectedIndex: number;
  showErrors: boolean;
  onAdd: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div className={styles.nav}>
      <div className={styles.navHeader}>
        <span>Вопросы ({draft.questions.length})</span>
        <button className="icon-button" title="Добавить вопрос" type="button" onClick={onAdd}>
          <Plus size={15} />
        </button>
      </div>
      <div className={styles.navList}>
        {draft.questions.map((question, index) => {
          const count = questionErrorCount(errors, index);
          return (
            <button
              className={`${styles.navItem}${index === selectedIndex ? ` ${styles.activeNavItem}` : ''}`}
              key={question.id ?? `q-nav-${index}`}
              type="button"
              onClick={() => onSelect(index)}
            >
              <span className={styles.navNum}>{index + 1}</span>
              <span className={styles.navText}>{question.questionText || 'Новый вопрос'}</span>
              {showErrors && count > 0 ? <span className={styles.navBadge}>{count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
});
