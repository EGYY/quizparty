import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import type { PhoneGameState } from '@features/phone-game';
import type { Player, RoomSummary } from '@quizparty/shared';
import { MediaType } from '@quizparty/shared';
import { CheckCircle2, Clock3, Lock, Trophy, Tv, Users } from 'lucide-react';
import { memo, useEffect, useState, type CSSProperties } from 'react';
import { FinalPhone } from './final-phone';
import { GameScreenHeader } from './game-screen-header';
import { PlayerScoreStrip } from './player-score-strip';
import styles from './phone-game-shell.module.scss';

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

function getQuestionTextClass(text: string) {
  if (text.length > 140) {
    return styles['question-title--dense'];
  }

  if (text.length > 90) {
    return styles['question-title--long'];
  }

  return '';
}

function getAnswerTextClass(text: string) {
  if (text.length > 80) {
    return styles['phone-answer--dense'];
  }

  if (text.length > 44) {
    return styles['phone-answer--long'];
  }

  return '';
}

function StartingCountdown({ startsAt }: { startsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  const [initialMs, setInitialMs] = useState(() => Math.max(1000, startsAt - Date.now()));
  const remainingMs = Math.max(0, startsAt - now);
  const remaining = Math.max(1, Math.ceil(remainingMs / 1000));
  const progress = Math.max(0, Math.min(100, Math.round((remainingMs / initialMs) * 100)));

  useEffect(() => {
    setNow(Date.now());
    setInitialMs(Math.max(1000, startsAt - Date.now()));

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, [startsAt]);

  return (
    <section className={`${styles['phone-round-screen']} ${styles['start-round-screen']}`}>
      <GameScreenHeader />
      <div
        className={styles['round-countdown-card']}
        role="status"
        aria-live="polite"
        style={{ '--countdown-progress': `${progress}%` } as CSSProperties}
      >
        <span>Старт через</span>
        <div className={styles['round-countdown-ring']} aria-label={`Старт через ${remaining}`}>
          <i />
          <i />
          <i />
          <strong key={remaining}>{remaining}</strong>
        </div>
        <small>{remaining <= 3 ? 'Приготовься!' : 'Вопрос появится на телефоне и TV'}</small>
      </div>
    </section>
  );
}

export const GameStateView = memo(function GameStateView({
  avatarId,
  gameState,
  nickname,
  onReadyChange,
  onLeave,
  onSubmitAnswer,
  ownPlayer,
  ownReady,
  playerId,
  room,
}: {
  avatarId: string;
  gameState: PhoneGameState;
  nickname: string;
  onReadyChange: (ready: boolean) => void;
  onLeave: () => void;
  onSubmitAnswer: (questionId: string, answerIndex: number) => void;
  ownPlayer: Player | undefined;
  ownReady: boolean;
  playerId: string;
  room: RoomSummary;
}) {
  const ownAvatar = getPhoneAvatar(ownPlayer?.avatarId ?? avatarId);

  if (gameState.phase === 'starting') {
    return <StartingCountdown startsAt={gameState.event.startsAt} />;
  }

  if (gameState.phase === 'question') {
    const selected = gameState.selectedAnswerIndex;
    const locked = Boolean(gameState.accepted);
    const timerPercent = Math.max(
      0,
      Math.min(
        100,
        Math.round((gameState.timer.remainingSeconds / gameState.timer.totalSeconds) * 100),
      ),
    );
    const media = gameState.round.question.media;
    const isAv = media?.type === MediaType.AUDIO || media?.type === MediaType.VIDEO;
    const questionText = gameState.round.question.questionText;
    const questionTextClass = getQuestionTextClass(questionText);
    const options = gameState.round.question.options;
    const hasOptions = Array.isArray(options);

    return (
      <section
        className={`${styles['phone-round-screen']} ${styles['question-controller']} ${isAv ? styles['question-controller--with-media'] : ''}`}
      >
        <GameScreenHeader />
        <div className={styles['question-meta-row']}>
          <div className={styles['question-meta-pill']}>
            <Trophy size={23} />
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
            <Users size={23} />
            <strong>
              {room.playerCount} / {room.maxPlayers}
            </strong>
          </div>
        </div>

        <div
          className={styles['question-progress-segments']}
          style={{ '--segments': gameState.round.totalRounds } as CSSProperties}
        >
          {Array.from({ length: gameState.round.totalRounds }).map((_, index) => (
            <span
              className={index < gameState.round.roundNumber ? styles.active : undefined}
              key={index}
            />
          ))}
        </div>

        {isAv ? (
          <div className={styles['phone-watch-tv-card']}>
            <Tv size={38} />
            <span>
              {media?.type === MediaType.AUDIO ? '🎵 Слушайте на TV' : '🎬 Смотрите на TV'}
            </span>
            {media?.prompt ? <small>{media.prompt}</small> : null}
          </div>
        ) : null}
        <h1 className={`${styles['question-title']} ${questionTextClass}`} aria-live="polite">
          {questionText}
        </h1>

        {hasOptions ? (
          <div className={styles['phone-answer-grid']}>
            {options.map((option, index) => (
              <button
                className={`${styles['phone-answer']} ${getAnswerTextClass(option)} ${selected === index ? styles.selected : ''} ${locked && selected !== index ? styles.dimmed : ''}`}
                disabled={locked}
                key={`${option}-${index}`}
                type="button"
                onClick={() => onSubmitAnswer(gameState.round.question.id, index)}
              >
                <span>{ANSWER_LETTERS[index]}</span>
                <strong>{option}</strong>
                {locked && selected === index ? <Lock size={27} /> : null}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles['answer-window-wait-card']}>
            <Clock3 size={34} />
            <strong>Готовься отвечать</strong>
            <span>Варианты появятся через {gameState.timer.remainingSeconds} с</span>
            <small>Сначала читаем вопрос, потом выбираем на скорость</small>
          </div>
        )}

        {locked ? (
          <div className={styles['answer-accepted-note']}>
            <CheckCircle2 size={25} />
            Ответ принят
          </div>
        ) : null}

        <PlayerScoreStrip
          avatarUrl={ownAvatar?.imageUrl ?? phoneAvatars[0].imageUrl}
          delta={locked ? undefined : 0}
          message={locked ? 'Отличный выбор!' : 'Выбирай быстрее остальных!'}
          nickname={nickname || ownPlayer?.nickname || 'Игрок'}
          rank={ownPlayer?.rank}
          score={ownPlayer?.score ?? 0}
        />
      </section>
    );
  }

  if (gameState.phase === 'reveal') {
    const ownScore = gameState.roundEnd.scores.find((score) => score.playerId === playerId);
    const correctOption = gameState.round?.question.options?.[gameState.roundEnd.correctIndex];

    return (
      <section className={`${styles['phone-round-screen']} ${styles['reveal-phone']}`}>
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

  if (gameState.phase === 'final') {
    const own = gameState.event.leaderboard.find((entry) => entry.playerId === playerId);
    return <FinalPhone leaderboard={gameState.event.leaderboard} own={own} onLeave={onLeave} />;
  }

  return (
    <section className={`${styles['phone-card']} ${styles['state-card']}`}>
      <p className="eyebrow">Лобби</p>
      <h2>Вы в комнате {room.roomCode}</h2>
      <p>Отметьтесь готовым и ждите старта на TV.</p>
      <button
        className={ownReady ? `${styles['phone-ready']} ${styles.active}` : styles['phone-ready']}
        type="button"
        onClick={() => onReadyChange(!ownReady)}
      >
        {ownReady ? 'Готов' : 'Я готов'}
      </button>
    </section>
  );
});
