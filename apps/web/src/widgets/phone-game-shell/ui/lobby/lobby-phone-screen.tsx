import type { Player, RoomSummary } from '@quizparty/shared';
import { MAX_PLAYERS } from '@quizparty/shared';
import { phonePopcornMascotUrl, quizPartyLogoUrl } from '@shared/lib';
import { ArrowLeft, Users } from 'lucide-react';
import { memo } from 'react';
import { LobbyConnectionStatus } from './lobby-connection-status';
import { LobbyPlayerList } from './lobby-player-list';
import { LobbyProfileCard } from './lobby-profile-card';
import { LobbyTvCard } from './lobby-tv-card';
import shellStyles from '../phone-game-shell.module.scss';
import styles from './lobby.module.scss';
import { ReactionBar } from '../shared/reaction-bar';

export const LobbyPhoneScreen = memo(function LobbyPhoneScreen({
  avatarId,
  connectionStatus,
  draftNickname,
  error,
  isEditingProfile,
  nickname,
  onAvatarChange,
  onDraftNicknameChange,
  onEditToggle,
  onLeave,
  onNicknameChange,
  onReadyChange,
  onReconnect,
  onSendReaction,
  ownPlayer,
  ownReady,
  players,
  room,
}: {
  avatarId: string;
  connectionStatus: string;
  draftNickname: string;
  error: string | undefined;
  isEditingProfile: boolean;
  nickname: string;
  onAvatarChange: (avatarId: string) => void;
  onDraftNicknameChange: (nickname: string) => void;
  onEditToggle: () => void;
  onLeave: () => void;
  onNicknameChange: (nickname: string) => void;
  onReadyChange: () => void;
  onReconnect: () => void;
  onSendReaction: (emoji: string) => void;
  ownPlayer: Player | undefined;
  ownReady: boolean;
  players: Player[];
  room: RoomSummary;
}) {
  const playerCount = players.length || room.playerCount;

  return (
    <section className={styles['phone-lobby-screen']}>
      <header className={styles['phone-lobby-hero']}>
        <div className={styles['phone-lobby-actions']}>
          <button className={styles['lobby-icon-button']} type="button" onClick={onLeave}>
            <ArrowLeft size={26} />
          </button>
        </div>
        <img alt="QuizParty" className={styles['phone-lobby-logo']} src={quizPartyLogoUrl} />
        <div className={styles['phone-lobby-code']}>
          <span>Комната</span>
          <strong>{room.roomCode}</strong>
        </div>
        <img alt="" className={styles['phone-lobby-mascot']} src={phonePopcornMascotUrl} />
      </header>

      <section className={styles['phone-lobby-panel']}>
        {error ? (
          <div className={`${shellStyles['phone-error']} ${styles['lobby-error']}`}>
            <span>{error}</span>
            <button type="button" onClick={onReconnect}>
              Повторить
            </button>
          </div>
        ) : null}

        <LobbyProfileCard
          avatarId={avatarId}
          draftNickname={draftNickname}
          isEditingProfile={isEditingProfile}
          nickname={nickname}
          onAvatarChange={onAvatarChange}
          onDraftNicknameChange={onDraftNicknameChange}
          onEditToggle={onEditToggle}
          onNicknameChange={onNicknameChange}
          onReadyChange={onReadyChange}
          ownPlayer={ownPlayer}
          ownReady={ownReady}
        />

        <section className={styles['lobby-players-card']}>
          <h2>
            <Users size={22} />
            Игроки{' '}
            <span>
              {playerCount} / {MAX_PLAYERS}
            </span>
          </h2>
          <LobbyPlayerList ownPlayerId={ownPlayer?.playerId} players={players} />
        </section>

        <LobbyTvCard />
      </section>

      <ReactionBar variant="lobby" onSend={onSendReaction} />
      <LobbyConnectionStatus connectionStatus={connectionStatus} />
    </section>
  );
});
