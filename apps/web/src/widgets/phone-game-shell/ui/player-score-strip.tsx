import { memo } from 'react';
import { Star } from 'lucide-react';
import styles from './phone-game-shell.module.scss';

export const PlayerScoreStrip = memo(function PlayerScoreStrip({
  avatarUrl,
  delta,
  message,
  nickname,
  // rank,
  score,
}: {
  avatarUrl: string;
  delta: number | undefined;
  message: string;
  nickname: string;
  rank: number | undefined;
  score: number;
}) {
  return (
    <div className={styles['question-player-strip']}>
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
