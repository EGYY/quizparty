import { type CSSProperties } from 'react';
import styles from './question-progress.module.scss';

export function QuestionProgress({
  roundNumber,
  totalRounds,
}: {
  roundNumber: number;
  totalRounds: number;
}) {
  return (
    <div
      className={styles['question-progress-segments']}
      style={{ '--segments': totalRounds } as CSSProperties}
    >
      {Array.from({ length: totalRounds }).map((_, index) => (
        <span className={index < roundNumber ? styles.active : undefined} key={index} />
      ))}
    </div>
  );
}
