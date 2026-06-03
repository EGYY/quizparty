import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import type { PhoneGameState } from '@features/phone-game';
import type { Player, RoomSummary } from '@quizparty/shared';
import { MediaType } from '@quizparty/shared';
import { CheckCircle2, Tv } from 'lucide-react';
import { PlayerScoreStrip } from '../shared/player-score-strip';
import shellStyles from '../phone-game-shell.module.scss';
import { AnswerGrid } from './answer-grid';
import { AnswerWindowWaitCard } from './answer-window-wait-card';
import { QuestionMetaRow } from './question-meta-row';
import { QuestionProgress } from './question-progress';
import styles from './question-view.module.scss';

type QuestionGameState = Extract<PhoneGameState, { phase: 'question' }>;

export function QuestionView({
  avatarId,
  gameState,
  nickname,
  onSubmitAnswer,
  ownPlayer,
  room,
}: {
  avatarId: string;
  gameState: QuestionGameState;
  nickname: string;
  onSubmitAnswer: (questionId: string, answerIndex: number) => void;
  ownPlayer: Player | undefined;
  room: RoomSummary;
}) {
  const ownAvatar = getPhoneAvatar(ownPlayer?.avatarId ?? avatarId);
  const selected = gameState.selectedAnswerIndex;
  const locked = Boolean(gameState.accepted);
  const media = gameState.round.question.media;
  const isAv = media?.type === MediaType.AUDIO || media?.type === MediaType.VIDEO;
  const options = gameState.round.question.options;
  const hasOptions = Array.isArray(options);

  return (
    <section
      className={`${shellStyles['phone-round-screen']} ${styles['question-controller']} ${isAv ? styles['question-controller--with-media'] : ''}`}
    >
      <QuestionMetaRow gameState={gameState} room={room} />

      <QuestionProgress
        roundNumber={gameState.round.roundNumber}
        totalRounds={gameState.round.totalRounds}
      />

      {isAv ? (
        <div className={styles['phone-watch-tv-card']}>
          <Tv size={38} />
          <span>{media?.type === MediaType.AUDIO ? '🎵 Слушайте на TV' : '🎬 Смотрите на TV'}</span>
        </div>
      ) : null}

      {hasOptions ? (
        <AnswerGrid
          locked={locked}
          options={options}
          questionId={gameState.round.question.id}
          selected={selected}
          onSubmitAnswer={onSubmitAnswer}
        />
      ) : (
        <AnswerWindowWaitCard remainingSeconds={gameState.timer.remainingSeconds} />
      )}

      {locked ? (
        <div className={styles['answer-accepted-note']}>
          <CheckCircle2 size={25} />
          Ответ принят
        </div>
      ) : null}

      <PlayerScoreStrip
        avatarUrl={ownAvatar?.imageUrl ?? phoneAvatars[0].imageUrl}
        className={styles['player-slot']}
        delta={locked ? undefined : 0}
        message={locked ? 'Отличный выбор!' : 'Выбирай быстрее остальных!'}
        nickname={nickname || ownPlayer?.nickname || 'Игрок'}
        rank={ownPlayer?.rank}
        score={ownPlayer?.score ?? 0}
      />
    </section>
  );
}
