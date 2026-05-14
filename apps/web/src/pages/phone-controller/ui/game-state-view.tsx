import { phoneAvatars } from '@entities/player/model';
import type { PhoneGameState } from '@features/phoneGame';
import type { Player, RoomSummary } from '@quizparty/shared';
import { MediaType } from '@quizparty/shared';
import { CheckCircle2, Lock, Trophy, Tv, Users } from 'lucide-react';
import { memo, type CSSProperties } from 'react';
import { getPhoneAvatar } from '../lib/get-phone-avatar';
import { FinalPhone } from './final-phone';
import { GameScreenHeader } from './game-screen-header';
import { PlayerScoreStrip } from './player-score-strip';

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const GameStateView = memo(function GameStateView({
  avatarId,
  gameState,
  nickname,
  onReadyChange,
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
  onSubmitAnswer: (questionId: string, answerIndex: number) => void;
  ownPlayer: Player | undefined;
  ownReady: boolean;
  playerId: string;
  room: RoomSummary;
}) {
  const ownAvatar = getPhoneAvatar(ownPlayer?.avatarId ?? avatarId);

  if (gameState.phase === 'starting') {
    const remaining = Math.max(0, Math.ceil((gameState.event.startsAt - Date.now()) / 1000));
    return (
      <section className="phone-round-screen start-round-screen">
        <GameScreenHeader />
        <div className="round-countdown-card">
          <span>Старт через</span>
          <strong>{remaining || 1}</strong>
          <small>Вопрос появится на телефоне и TV</small>
        </div>
      </section>
    );
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
    // const questionImage = isAv
    //   ? undefined
    //   : resolveAssetUrl(media?.url) ??
    //     resolveAssetUrl(room.selectedQuiz.coverUrl) ??
    //     phoneQuestionFallbackUrl;

    return (
      <section className="phone-round-screen question-controller">
        <GameScreenHeader />
        <div className="question-meta-row">
          <div className="question-meta-pill">
            <Trophy size={23} />
            <span>Раунд</span>
            <strong>
              {gameState.round.roundNumber} / {gameState.round.totalRounds}
            </strong>
          </div>
          <div
            className="question-timer-ring"
            style={{ '--timer-progress': `${timerPercent}%` } as CSSProperties}
          >
            <strong>{gameState.timer.remainingSeconds}</strong>
            <span>с</span>
          </div>
          <div className="question-meta-pill">
            <Users size={23} />
            <strong>
              {room.playerCount} / {room.maxPlayers}
            </strong>
          </div>
        </div>

        <div
          className="question-progress-segments"
          style={{ '--segments': gameState.round.totalRounds } as CSSProperties}
        >
          {Array.from({ length: gameState.round.totalRounds }).map((_, index) => (
            <span
              className={index < gameState.round.roundNumber ? 'active' : undefined}
              key={index}
            />
          ))}
        </div>

        {isAv ? (
          <div className="phone-watch-tv-card">
            <Tv size={38} />
            <span>
              {media?.type === MediaType.AUDIO ? '🎵 Слушайте на TV' : '🎬 Смотрите на TV'}
            </span>
            {media?.prompt ? <small>{media.prompt}</small> : null}
          </div>
        ) : null}
        <h1 className="question-title">{gameState.round.question.questionText}</h1>

        <div className="phone-answer-grid">
          {gameState.round.question.options.map((option, index) => (
            <button
              className={`phone-answer ${selected === index ? 'selected' : ''} ${locked && selected !== index ? 'dimmed' : ''}`}
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

        {locked ? (
          <div className="answer-accepted-note">
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
    const correctOption = gameState.round?.question.options[gameState.roundEnd.correctIndex];

    return (
      <section className="phone-round-screen reveal-phone">
        <GameScreenHeader />
        <div className="round-result-card">
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
    return <FinalPhone leaderboard={gameState.event.leaderboard} own={own} />;
  }

  return (
    <section className="phone-card state-card">
      <p className="eyebrow">Лобби</p>
      <h2>Вы в комнате {room.roomCode}</h2>
      <p>Отметьтесь готовым и ждите старта на TV.</p>
      <button
        className={ownReady ? 'phone-ready active' : 'phone-ready'}
        type="button"
        onClick={() => onReadyChange(!ownReady)}
      >
        {ownReady ? 'Готов' : 'Я готов'}
      </button>
    </section>
  );
});
