import { Trophy, Users } from 'lucide-react';
import { type CSSProperties } from 'react';
import type { PhoneGameState } from '@features/phone-game';
import type { RoomSummary } from '@quizparty/shared';
import styles from './question-meta-row.module.scss';

type QuestionGameState = Extract<PhoneGameState, { phase: 'question' }>;

export function QuestionMetaRow({
  gameState,
  room,
}: {
  gameState: QuestionGameState;
  room: RoomSummary;
}) {
  const timerPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round((gameState.timer.remainingSeconds / gameState.timer.totalSeconds) * 100),
    ),
  );

  return (
    <div className={styles['question-meta-row']}>
      <div className={styles['question-meta-pill']}>
        <Trophy size={20} />
        <span>Раунд</span>
        <strong>
          {gameState.round.roundNumber} / {gameState.round.totalRounds}
        </strong>
      </div>
      <div
        className={styles['question-timer-ring']}
        style={{ '--timer-progress': `${timerPercent}%` } as CSSProperties}
      >
        <strong>{gameState.timer.remainingSeconds}</strong>
        <span>с</span>
      </div>
      <div className={styles['question-meta-pill']}>
        <Users size={20} />
        <strong>
          {room.playerCount} / {room.maxPlayers}
        </strong>
      </div>
    </div>
  );
}
