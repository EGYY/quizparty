import type { LeaderboardEntry } from '@quizparty/shared';

export function getFinalLeaderboard(leaderboard: LeaderboardEntry[]) {
  return leaderboard
    .sort((a, b) => b.score - a.score || a.rank - b.rank)
    .map((player, index) => ({ ...player, rank: index + 1 }));
}
