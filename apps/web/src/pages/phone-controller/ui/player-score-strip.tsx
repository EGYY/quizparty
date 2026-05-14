import { Star } from 'lucide-react';

export function PlayerScoreStrip({
  avatarUrl,
  delta,
  message,
  nickname,
  rank,
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
    <div className="question-player-strip">
      <img alt="" src={avatarUrl} />
      <div className="question-player-name">
        <strong>{nickname}</strong>
        <span>
          <Star size={18} />
          {score}
        </span>
      </div>
      <div className="question-score-delta">
        {typeof delta === 'number' && delta > 0 ? `+${delta}` : '✓'}
      </div>
      <div className="question-rank">
        <strong>{rank ?? '-'}</strong>
        <span>место</span>
      </div>
      <p>{message}</p>
    </div>
  );
}
