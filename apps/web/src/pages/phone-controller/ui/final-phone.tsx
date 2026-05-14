import { memo } from 'react';
import { Star, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@quizparty/shared';
import { phoneAvatars } from '@entities/player/model';
import { getPhoneAvatar } from '../lib/get-phone-avatar';
import { GameScreenHeader } from './game-screen-header';

export const FinalPhone = memo(function FinalPhone({
  leaderboard,
  own,
}: {
  leaderboard: LeaderboardEntry[];
  own: LeaderboardEntry | undefined;
}) {
  const ownAvatar = getPhoneAvatar(own?.avatarId);
  const winner = leaderboard[0];

  return (
    <section className="phone-round-screen final-phone">
      <GameScreenHeader />

      <div className="final-hero-card">
        <div className="final-trophy-badge">
          <Trophy size={42} />
        </div>
        <span>Финал игры</span>
        <h1>{own ? `${own.rank} место` : 'Игра завершена'}</h1>
        <small>{winner ? `Победитель: ${winner.nickname}` : 'Спасибо за игру!'}</small>
      </div>

      <section className="final-own-card">
        <img alt="" src={ownAvatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
        <div className="final-own-main">
          <strong>{own?.nickname ?? 'Игрок'}</strong>
          <span>
            <Star size={19} />
            {own?.score ?? 0} очков
          </span>
        </div>
        <div className="final-rank-medal">
          <strong>{own?.rank ?? '-'}</strong>
          <span>место</span>
        </div>
        <div className="final-stat-grid">
          <div>
            <span>Верно</span>
            <strong>{own?.correctAnswers ?? 0}</strong>
          </div>
          <div>
            <span>Серия</span>
            <strong>{own?.bestStreak ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="final-leaderboard">
        <h2>Таблица лидеров</h2>
        <div>
          {leaderboard.slice(0, 5).map((entry) => {
            const avatar = getPhoneAvatar(entry.avatarId);

            return (
              <div
                className={entry.playerId === own?.playerId ? 'own' : undefined}
                key={entry.playerId}
              >
                <span className="final-place">#{entry.rank}</span>
                <img alt="" src={avatar?.imageUrl ?? phoneAvatars[0].imageUrl} />
                <strong>{entry.nickname}</strong>
                <em>{entry.score}</em>
              </div>
            );
          })}
        </div>
      </section>

      <div className="final-message">🎉 Отличная партия! Результаты уже на TV.</div>
    </section>
  );
});
