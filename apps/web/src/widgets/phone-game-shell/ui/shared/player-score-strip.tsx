import { memo } from 'react';
import { Star } from 'lucide-react';
import styles from './player-score-strip.module.scss';

export const PlayerScoreStrip = memo(function PlayerScoreStrip({
  avatarUrl,
  className = '',
  delta,
  message,
  nickname,
  // rank,
  score,
}: {
  avatarUrl: string;
  className?: string | undefined;
  delta: number | undefined;
  message: string;
  nickname: string;
  rank: number | undefined;
  score: number;
}) {
  const stripClassName = `${styles['question-player-strip']} ${className}`.trim();

  return (
    <div className={stripClassName}>
      <img alt="" src={avatarUrl} />
      <div className={styles['question-player-name']}>
        <strong>{nickname}</strong>
        <span>
          <Star size={18} />
          {score}
        </span>
      </div>
      <div className={styles['question-score-delta']}>
        {typeof delta === 'number' && delta > 0 ? `+${delta}` : '✓'}
      </div>
      {/* <div className={styles['question-rank']}>
        <strong>{rank ?? '-'}</strong>
        <span>место</span>
      </div> */}
      <p>{message}</p>
    </div>
  );
});
