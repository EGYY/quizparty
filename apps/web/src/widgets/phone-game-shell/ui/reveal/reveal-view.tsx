import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import type { PhoneGameState } from '@features/phone-game';
import { GameMode } from '@quizparty/shared';
import { PlayerScoreStrip } from '../shared/player-score-strip';
import shellStyles from '../phone-game-shell.module.scss';
import styles from './reveal-view.module.scss';

type RevealGameState = Extract<PhoneGameState, { phase: 'reveal' }>;

const variants = ['A', 'B', 'C', 'D'];

function formatSeconds(ms: number) {
  return `${(ms / 1000).toFixed(2).replace('.', ',')} сек`;
}

export function RevealView({
  avatarId,
  gameState,
  nickname,
  playerId,
}: {
  avatarId: string;
  gameState: RevealGameState;
  nickname: string;
  playerId: string;
}) {
  const ownScore = gameState.roundEnd.scores.find((score) => score.playerId === playerId);
  const correctOption = gameState.round?.question.options?.[gameState.roundEnd.correctIndex];
  const isReactionMode = gameState.roundEnd.mode === GameMode.REACTION;
  const reactionWinner = gameState.roundEnd.reactionWinner;
  const isOwnReactionWin = reactionWinner?.playerId === playerId;
  const ownDelayMs =
    typeof ownScore?.responseMs === 'number' && reactionWinner
      ? Math.max(0, ownScore.responseMs - reactionWinner.responseMs)
      : undefined;

  return (
    <section className={`${shellStyles['phone-round-screen']} ${styles['reveal-phone']}`}>
      <div className={styles['round-result-card']} role="status" aria-live="polite">
        <span>Правильный ответ</span>
        <h1>{correctOption ?? `Вариант ${variants[gameState.roundEnd.correctIndex]}`}</h1>
      </div>

      {isReactionMode ? (
        reactionWinner ? (
          <div className={styles['reaction-result-card']}>
            <span>{isOwnReactionWin ? 'Ты быстрее всех' : 'Самый быстрый'}</span>
            <div className={styles['reaction-winner-row']}>
              <img
                alt=""
                src={getPhoneAvatar(reactionWinner.avatarId)?.imageUrl ?? phoneAvatars[0].imageUrl}
              />
              <div>
                <strong>{reactionWinner.nickname}</strong>
                <small>{formatSeconds(reactionWinner.responseMs)}</small>
              </div>
            </div>
            {!isOwnReactionWin ? (
              <p>
                {typeof ownScore?.responseMs === 'number'
                  ? `Твой ответ: ${formatSeconds(ownScore.responseMs)}. Отставание: +${formatSeconds(ownDelayMs ?? 0)}`
                  : 'Ты не успел ответить в этом раунде.'}
              </p>
            ) : null}
          </div>
        ) : (
          <div className={styles['reaction-result-card']}>
            <span>Никто не успел ответить</span>
          </div>
        )
      ) : null}

      {gameState.roundEnd.explanation ? <p>{gameState.roundEnd.explanation}</p> : null}
      <PlayerScoreStrip
        avatarUrl={
          getPhoneAvatar(ownScore?.avatarId ?? avatarId)?.imageUrl ?? phoneAvatars[0].imageUrl
        }
        delta={ownScore?.scoreDelta ?? 0}
        message={ownScore?.answeredCorrectly ? 'Отличный выбор!' : 'Следующий вопрос твой!'}
        nickname={ownScore?.nickname ?? nickname}
        rank={ownScore?.rank}
        score={ownScore?.score ?? 0}
      />
    </section>
  );
}
