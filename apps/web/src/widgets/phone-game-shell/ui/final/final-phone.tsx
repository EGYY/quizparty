import { memo, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { LogOut, Star, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@quizparty/shared';
import { getPhoneAvatar, phoneAvatars } from '@entities/player';
import shellStyles from '../phone-game-shell.module.scss';
import ownStyles from './final-own-card.module.scss';
import styles from './final-phone.module.scss';

type RankedLeaderboardEntry = LeaderboardEntry & { displayRank: number };
type ConfettiPiece = {
  color: string;
  delay: number;
  duration: number;
  left: number;
  size: 'long' | 'short' | 'square';
};

const FINAL_REVEAL_DELAY_MS = 3000;
const confettiColors = ['#ffd166', '#b9ff72', '#7ea4ff', '#f05e7b', '#ffffff'];
const confettiPieces: ConfettiPiece[] = Array.from({ length: 32 }, (_, index) => ({
  color: confettiColors[index % confettiColors.length] ?? '#ffd166',
  delay: (index * 137) % 1500,
  duration: 2600 + ((index * 211) % 1800),
  left: (index * 37) % 100,
  size: index % 5 === 0 ? 'square' : index % 3 === 0 ? 'short' : 'long',
}));

function isTvHostEntry(entry: LeaderboardEntry): boolean {
  return (
    entry.avatarId === 'popcorn-mascot' && entry.nickname.trim().toLowerCase() === 'tv ведущий'
  );
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
  const [showResults, setShowResults] = useState(false);
  const players = getSortedPlayers(leaderboard);
  const sortedOwn = players.find((entry) => entry.playerId === own?.playerId);
  const ownResult = sortedOwn ?? own;
  const ownAvatar = getPhoneAvatar(ownResult?.avatarId);
  const ownRank = sortedOwn?.displayRank ?? own?.rank;
  const winner = players[0];
  const revealKey = useMemo(
    () => `${own?.playerId ?? 'guest'}:${leaderboard.map((entry) => entry.playerId).join('|')}`,
    [leaderboard, own?.playerId],
  );

  useEffect(() => {
    setShowResults(false);
    const timer = window.setTimeout(() => setShowResults(true), FINAL_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [revealKey]);

  return (
    <section className={`${shellStyles['phone-round-screen']} ${styles['final-phone']}`}>
      {showResults ? <FinalConfetti /> : null}

      {!showResults ? (
        <div className={`${styles['final-hero-card']} ${styles['final-wait-card']}`}>
          <div className={styles['final-trophy-badge']}>
            <Trophy size={42} />
          </div>
          <span>Финал игры</span>
          <h1>Подводим итоги</h1>
          <small>Результаты появятся через пару секунд</small>
        </div>
      ) : (
        <div className={styles['final-results-reveal']}>
          <div className={styles['final-hero-card']}>
            <div className={styles['final-trophy-badge']}>
              <Trophy size={42} />
            </div>
            <span>Финал игры</span>
            <h1>{ownRank ? `${ownRank} место` : 'Игра завершена'}</h1>
            <small>{winner ? `Победитель: ${winner.nickname}` : 'Спасибо за игру!'}</small>
          </div>

          <section className={ownStyles['final-own-card']}>
            <img alt="" src={ownAvatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
            <div className={ownStyles['final-own-main']}>
              <strong>{ownResult?.nickname ?? 'Игрок'}</strong>
              <span>
                <Star size={19} />
                {ownResult?.score ?? 0} очков
              </span>
            </div>
            <div className={ownStyles['final-rank-medal']}>
              <strong>{ownRank ?? '-'}</strong>
              <span>место</span>
            </div>
            <div className={ownStyles['final-stat-grid']}>
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

          <button className={styles['final-leave-button']} type="button" onClick={onLeave}>
            <LogOut size={20} />
            Подключиться к другой комнате
          </button>

          <div className={styles['final-message']}>Отличная партия! Результаты уже на TV.</div>
        </div>
      )}
    </section>
  );
});

const FinalConfetti = memo(function FinalConfetti() {
  return (
    <div className={styles['final-confetti-layer']} aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <span
          className={`${styles['final-confetti-piece']} ${styles[`final-confetti-${piece.size}`]}`}
          key={`${piece.left}-${piece.delay}-${index}`}
          style={
            {
              '--confetti-color': piece.color,
              '--confetti-delay': `${piece.delay}ms`,
              '--confetti-duration': `${piece.duration}ms`,
              '--confetti-left': `${piece.left}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
});
