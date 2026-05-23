import { Check, X } from 'lucide-react';
import type { QuizDraft } from '@quizparty/shared';
import checklistStyles from '@shared/ui/checklist.module.scss';
import layout from '@shared/ui/layout.module.scss';
import styles from './validation-panel.module.scss';

export function ValidationPanel({ validation }: { validation: QuizDraft['validation'] }) {
  const failedCount = validation.filter((item) => !item.passed).length;

  return (
    <section className={`${layout.panel ?? ''} ${styles.checklistPanel}`}>
      <details className={styles.validationDetails} open>
        <summary>
          <span>Чеклист</span>
          <b>{failedCount ? `${failedCount} ошибок` : 'Готово'}</b>
        </summary>
        <div className={`${checklistStyles.checklist} ${styles.checklist}`}>
          {validation.map((item) => (
            <div
              className={
                item.passed
                  ? `${checklistStyles.checkRow} ${checklistStyles.checkRowPassed}`
                  : checklistStyles.checkRow
              }
              key={item.code}
            >
              {item.passed ? <Check size={14} /> : <X size={14} />}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
