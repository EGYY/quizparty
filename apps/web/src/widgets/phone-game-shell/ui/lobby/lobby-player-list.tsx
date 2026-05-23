import { memo } from 'react';
import { Check } from 'lucide-react';
import { LobbyPlayerStatus, PlayerConnectionStatus } from '@quizparty/shared';
import type { Player } from '@quizparty/shared';
import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import styles from './lobby-player-list.module.scss';

export const LobbyPlayerList = memo(function LobbyPlayerList({
  ownPlayerId,
  players,
}: {
  ownPlayerId: string | undefined;
  players: Player[];
}) {
  const visiblePlayers = players.filter((player) => player.playerId !== ownPlayerId);
  const emptySlots = Array.from({ length: Math.max(0, 2 - visiblePlayers.length) });

  return (
    <div className={styles['lobby-player-list']}>
      {visiblePlayers.map((player) => {
        const avatar = getPhoneAvatar(player.avatarId);
        const isDisconnected = player.connectionStatus === PlayerConnectionStatus.DISCONNECTED;
        const isReady = player.lobbyStatus === LobbyPlayerStatus.READY;

        return (
          <div
            className={`${styles['lobby-player-row']} ${isReady ? styles.ready : ''} ${isDisconnected ? styles.offline : ''}`}
            key={player.playerId}
          >
            <img alt="" src={avatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
            <div>
              <strong>{player.nickname}</strong>
              <small>
                {player.isHost
                  ? 'ведущий'
                  : isDisconnected
                    ? 'отключен'
                    : isReady
                      ? 'готов'
                      : 'ждет'}
              </small>
            </div>
            <span className={styles['lobby-player-status']}>
              {isReady ? <Check size={24} /> : '•••'}
            </span>
          </div>
        );
      })}

      {emptySlots.map((_, index) => (
        <div className={`${styles['lobby-player-row']} ${styles.empty}`} key={`empty-${index}`}>
          <span className={styles['lobby-empty-avatar']}>?</span>
          <div>
            <strong>Место ожидает игрока</strong>
            <small>...</small>
          </div>
        </div>
      ))}
    </div>
  );
});
