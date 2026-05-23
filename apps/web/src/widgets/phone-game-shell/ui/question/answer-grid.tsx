import { Lock } from 'lucide-react';
import styles from './answer-grid.module.scss';

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

function getAnswerTextClass(text: string) {
  if (text.length > 80) return styles['phone-answer--dense'];
  if (text.length > 44) return styles['phone-answer--long'];
  return '';
}

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
      {options.map((option, index) => (
        <button
          className={`${styles['phone-answer']} ${getAnswerTextClass(option)} ${selected === index ? styles.selected : ''} ${locked && selected !== index ? styles.dimmed : ''}`}
          disabled={locked}
          key={`${option}-${index}`}
          type="button"
          onClick={() => onSubmitAnswer(questionId, index)}
        >
          <span>{ANSWER_LETTERS[index]}</span>
          <strong>{option}</strong>
          {locked && selected === index ? <Lock size={27} /> : null}
        </button>
      ))}
    </div>
  );
}
