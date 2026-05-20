import { memo } from 'react';
import { LogOut, Star, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@quizparty/shared';
import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import { GameScreenHeader } from './game-screen-header';
import styles from './phone-game-shell.module.scss';

type RankedLeaderboardEntry = LeaderboardEntry & { displayRank: number };

function isTvHostEntry(entry: LeaderboardEntry): boolean {
  return entry.avatarId === 'popcorn-mascot' && entry.nickname.trim().toLowerCase() === 'tv ведущий';
}

function getSortedPlayers(leaderboard: LeaderboardEntry[]): RankedLeaderboardEntry[] {
  return [...leaderboard]
    .filter((entry) => !isTvHostEntry(entry))
    .sort((a, b) => b.score - a.score || a.rank - b.rank || a.nickname.localeCompare(b.nickname))
    .map((entry, index) => ({ ...entry, displayRank: index + 1 }));
}

export const FinalPhone = memo(function FinalPhone({
  leaderboard,
  onLeave,
  own,
}: {
  leaderboard: LeaderboardEntry[];
  onLeave: () => void;
  own: LeaderboardEntry | undefined;
}) {
  const players = getSortedPlayers(leaderboard);
  const sortedOwn = players.find((entry) => entry.playerId === own?.playerId);
  const ownResult = sortedOwn ?? own;
  const ownAvatar = getPhoneAvatar(ownResult?.avatarId);
  const ownRank = sortedOwn?.displayRank ?? own?.rank;
  const winner = players[0];

  return (
    <section className={`${styles['phone-round-screen']} ${styles['final-phone']}`}>
      <GameScreenHeader />

      <div className={styles['final-hero-card']}>
        <div className={styles['final-trophy-badge']}>
          <Trophy size={42} />
        </div>
        <span>Финал игры</span>
        <h1>{ownRank ? `${ownRank} место` : 'Игра завершена'}</h1>
        <small>{winner ? `Победитель: ${winner.nickname}` : 'Спасибо за игру!'}</small>
      </div>

      <section className={styles['final-own-card']}>
        <img alt="" src={ownAvatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
        <div className={styles['final-own-main']}>
          <strong>{ownResult?.nickname ?? 'Игрок'}</strong>
          <span>
            <Star size={19} />
            {ownResult?.score ?? 0} очков
          </span>
        </div>
        <div className={styles['final-rank-medal']}>
          <strong>{ownRank ?? '-'}</strong>
          <span>место</span>
        </div>
        <div className={styles['final-stat-grid']}>
          <div>
            <span>Верно</span>
            <strong>{ownResult?.correctAnswers ?? 0}</strong>
          </div>
          <div>
            <span>Серия</span>
            <strong>{ownResult?.bestStreak ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className={styles['final-leaderboard']}>
        <h2>Таблица лидеров</h2>
        <div>
          {players.map((entry) => {
            const avatar = getPhoneAvatar(entry.avatarId);

            return (
              <div
                className={entry.playerId === ownResult?.playerId ? styles.own : undefined}
                key={entry.playerId}
              >
                <span className={styles['final-place']}>#{entry.displayRank}</span>
                <img alt="" src={avatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
                <strong>{entry.nickname}</strong>
                <em>{entry.score}</em>
              </div>
            );
          })}
        </div>
      </section>

      <button className={styles['final-leave-button']} type="button" onClick={onLeave}>
        <LogOut size={20} />
        Подключиться к другой комнате
      </button>

      <div className={styles['final-message']}>🎉 Отличная партия! Результаты уже на TV.</div>
    </section>
  );
});
