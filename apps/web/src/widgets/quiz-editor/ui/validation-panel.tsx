import { Check, X } from 'lucide-react';
import type { QuizDraft } from '@quizparty/shared';
import styles from './quiz-editor.module.scss';

export function ValidationPanel({ validation }: { validation: QuizDraft['validation'] }) {
  return (
    <section className={`panel ${styles.checklistPanel}`}>
      <h3 className={styles.checklistTitle}>Чеклист</h3>
      <div className="checklist">
        {validation.map((item) => (
          <div className={item.passed ? 'check-row passed' : 'check-row'} key={item.code}>
            {item.passed ? <Check size={14} /> : <X size={14} />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
