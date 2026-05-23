import type { PhoneGameState } from '@features/phone-game';
import type { Player, RoomSummary } from '@quizparty/shared';
import { memo } from 'react';
import { Eyebrow } from '@shared/ui';
import { FinalPhone } from './final/final-phone';
import { QuestionView } from './question/question-view';
import { RevealView } from './reveal/reveal-view';
import { StartingCountdown } from './starting-countdown';
import styles from './phone-game-shell.module.scss';

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
  if (gameState.phase === 'starting') {
    return <StartingCountdown startsAt={gameState.event.startsAt} />;
  }

  if (gameState.phase === 'question') {
    return (
      <QuestionView
        avatarId={avatarId}
        gameState={gameState}
        nickname={nickname}
        onSubmitAnswer={onSubmitAnswer}
        ownPlayer={ownPlayer}
        room={room}
      />
    );
  }

  if (gameState.phase === 'reveal') {
    return (
      <RevealView
        avatarId={avatarId}
        gameState={gameState}
        nickname={nickname}
        playerId={playerId}
      />
    );
  }

  if (gameState.phase === 'final') {
    const own = gameState.event.leaderboard.find((entry) => entry.playerId === playerId);
    return <FinalPhone leaderboard={gameState.event.leaderboard} own={own} onLeave={onLeave} />;
  }

  return (
    <section className={`${styles['phone-card']} ${styles['state-card']}`}>
      <Eyebrow>Лобби</Eyebrow>
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
