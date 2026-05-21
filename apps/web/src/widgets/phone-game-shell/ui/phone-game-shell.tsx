import { useCallback, useEffect, useState } from 'react';
import { LobbyPlayerStatus } from '@quizparty/shared';
import type { Player, RoomSummary } from '@quizparty/shared';
import { usePhoneGame } from '@features/phone-game';
import { GameStateView } from './game-state-view';
import { LobbyPhoneScreen } from './lobby-phone-screen';
import styles from './phone-game-shell.module.scss';
import { ReactionBar } from './reaction-bar';

const EMPTY_PLAYERS: Player[] = [];

export function PhoneGameShell({
  avatarId,
  nickname,
  onAvatarChange,
  onNicknameChange,
  onLeave,
  playerId,
  room,
}: {
  avatarId: string;
  nickname: string;
  onAvatarChange: (avatarId: string) => void;
  onLeave: () => void;
  onNicknameChange: (nickname: string) => void;
  playerId: string;
  room: RoomSummary;
}) {
  const game = usePhoneGame({ avatarId, nickname, playerId, room });
  const {
    connectionStatus,
    error,
    fatalError,
    gameState,
    lobbyState,
    ownPlayer,
    reconnect,
    roomClosed,
    sendReaction,
    setReady,
    submitAnswer,
    updateProfile,
  } = game;
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    updateProfile({ avatarId, nickname });
  }, [avatarId, nickname, updateProfile]);

  const ownReady = ownPlayer?.lobbyStatus === LobbyPlayerStatus.READY;
  const isPaused =
    gameState.phase === 'question' || gameState.phase === 'reveal'
      ? Boolean(gameState.isPaused)
      : false;
  const showGameReactions =
    !isPaused && (gameState.phase === 'reveal' || gameState.phase === 'final');

  useEffect(() => {
    if (!roomClosed) return;
    onLeave();
  }, [onLeave, roomClosed]);

  const toggleProfileEditor = useCallback(() => {
    setIsEditingProfile((value) => !value);
  }, []);

  const toggleReady = useCallback(() => {
    setReady(!ownReady);
  }, [ownReady, setReady]);

  if (fatalError) {
    return (
      <main className={styles['phone-shell']}>
        <section
          className={`${styles['phone-card']} ${styles['state-card']}`}
          aria-live="assertive"
          role="alert"
        >
          <p className="eyebrow">Не удалось подключиться</p>
          <h2>{fatalError}</h2>
          <button className={styles['phone-primary']} type="button" onClick={onLeave}>
            Вернуться к вводу кода
          </button>
        </section>
      </main>
    );
  }

  if (gameState.phase === 'lobby') {
    return (
      <main className={`${styles['phone-shell']} ${styles['phone-shell--lobby']}`}>
        <LobbyPhoneScreen
          avatarId={avatarId}
          connectionStatus={connectionStatus}
          draftNickname={draftNickname}
          error={error ?? undefined}
          isEditingProfile={isEditingProfile}
          nickname={nickname}
          onAvatarChange={onAvatarChange}
          onDraftNicknameChange={setDraftNickname}
          onEditToggle={toggleProfileEditor}
          onLeave={onLeave}
          onNicknameChange={onNicknameChange}
          onReadyChange={toggleReady}
          onReconnect={reconnect}
          onSendReaction={sendReaction}
          ownPlayer={ownPlayer}
          ownReady={ownReady}
          players={lobbyState?.players ?? EMPTY_PLAYERS}
          room={room}
        />
      </main>
    );
  }

  return (
    <main className={styles['phone-shell']}>
      <section className={`${styles['phone-controller']} ${styles['game-controller-shell']}`}>
        <header className={styles['phone-top']}>
          <div>
            <p className="eyebrow">Комната {room.roomCode}</p>
            <h1>{room.selectedQuiz.title}</h1>
          </div>
          <span
            className={`${styles['phone-signal']} ${styles[connectionStatus] ?? ''}`}
            role="status"
            aria-live="polite"
          >
            {connectionStatus}
          </span>
        </header>

        {error ? (
          <div className={styles['phone-error']}>
            <span>{error}</span>
            <button type="button" onClick={reconnect}>
              Повторить
            </button>
          </div>
        ) : null}

        <GameStateView
          avatarId={avatarId}
          gameState={gameState}
          nickname={nickname}
          onLeave={onLeave}
          onReadyChange={setReady}
          onSubmitAnswer={submitAnswer}
          ownPlayer={ownPlayer}
          ownReady={ownReady}
          playerId={playerId}
          room={room}
        />

        {showGameReactions ? <ReactionBar onSend={sendReaction} /> : null}

        {isPaused ? (
          <div className={styles['pause-overlay']} role="status" aria-live="polite">
            <div className={styles['pause-overlay-card']}>
              <span>Ведущий поставил игру на паузу</span>
              <strong>Пауза</strong>
              <small>Оставайтесь на месте, игра скоро продолжится.</small>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
