import { Lock } from 'lucide-react';
import styles from './answer-grid.module.scss';

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function AnswerGrid({
  locked,
  options,
  questionId,
  selected,
  onSubmitAnswer,
}: {
  locked: boolean;
  options: string[];
  questionId: string;
  selected: number | undefined;
  onSubmitAnswer: (questionId: string, answerIndex: number) => void;
}) {
  return (
    <div className={styles['phone-answer-grid']}>
      {options.map((_, index) => {
        const answerLetter = ANSWER_LETTERS[index] ?? String(index + 1);

        return (
          <button
            aria-label={`Answer ${answerLetter}`}
            className={`${styles['phone-answer']} ${selected === index ? styles.selected : ''} ${locked && selected !== index ? styles.dimmed : ''}`}
            disabled={locked}
            key={`${questionId}-${index}`}
            type="button"
            onClick={() => onSubmitAnswer(questionId, index)}
          >
            <span>{answerLetter}</span>
            {locked && selected === index ? <Lock size={27} /> : null}
          </button>
        );
      })}
    </div>
  );
}
