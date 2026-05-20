import type { LeaderboardEntry } from '@quizparty/shared';

function isTvHostEntry(player: LeaderboardEntry): boolean {
  return (
    player.avatarId === 'popcorn-mascot' &&
    player.nickname.trim().toLowerCase() === 'tv ведущий'
  );
}

export function getFinalLeaderboard(leaderboard: LeaderboardEntry[]) {
  return [...leaderboard]
    .filter(player => !isTvHostEntry(player))
    .sort((a, b) => b.score - a.score || a.rank - b.rank)
    .map((player, index) => ({ ...player, rank: index + 1 }));
}
