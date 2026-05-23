import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import type { PhoneGameState } from '@features/phone-game';
import { GameScreenHeader } from '../shared/game-screen-header';
import { PlayerScoreStrip } from '../shared/player-score-strip';
import shellStyles from '../phone-game-shell.module.scss';
import styles from './reveal-view.module.scss';

type RevealGameState = Extract<PhoneGameState, { phase: 'reveal' }>;

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

  return (
    <section className={`${shellStyles['phone-round-screen']} ${styles['reveal-phone']}`}>
      <GameScreenHeader />
      <div className={styles['round-result-card']} role="status" aria-live="polite">
        <span>Правильный ответ</span>
        <h1>{correctOption ?? `Вариант ${gameState.roundEnd.correctIndex + 1}`}</h1>
      </div>
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
