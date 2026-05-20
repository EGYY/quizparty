import type { LeaderboardEntry, ReactionEvent } from '@quizparty/shared';
import { soundFinal } from '@shared/assets/sounds';
import { s, sv } from '@shared/config/scale';
import { useMusicTrack } from '@shared/ui/music-provider';
import { useMemo } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { getFinalLeaderboard } from './model';
import { useFinalResultsReveal } from './model/use-final-results-reveal';
import { FinalConfetti } from './ui/final-confetti';
import { FinalHeader } from './ui/final-header';
import { FinalHostActions } from './ui/final-host-actions';
import { FinalRating } from './ui/final-rating';
import { WinnersPodium } from './ui/podium';

export function FinalResults({
  leaderboard,
  onChooseQuiz,
  onPlayAgain,
  reactions,
}: {
  leaderboard: LeaderboardEntry[];
  onChooseQuiz: () => void;
  onPlayAgain: () => void;
  reactions: ReactionEvent[];
}) {
  const { height } = useWindowDimensions();
  const sortedLeaderboard = useMemo(
    () => getFinalLeaderboard(leaderboard),
    [leaderboard],
  );
  const first = sortedLeaderboard.find(player => player.rank === 1);
  const second = sortedLeaderboard.find(player => player.rank === 2);
  const third = sortedLeaderboard.find(player => player.rank === 3);
  const rest = sortedLeaderboard.slice(3);

  useMusicTrack(soundFinal, false);
  const contentAnimationStyle = useFinalResultsReveal();

  return (
    <View style={[styles.root]}>
      <FinalConfetti screenHeight={height} />
      <FinalHeader />

      <Animated.View
        style={[
          styles.content,
          contentAnimationStyle,
        ]}
      >
        <WinnersPodium first={first} second={second} third={third} />
        <View style={[styles.side]}>
          <FinalRating players={rest} />
          <FinalHostActions
            onChooseQuiz={onChooseQuiz}
            onPlayAgain={onPlayAgain}
            reactions={reactions}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: s(38),
    paddingBottom: sv(28),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(28),
    zIndex: 2,
  },

  side: {
    flex: 1,
    minWidth: s(500),
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(12),
    paddingTop: sv(18),
  },
});
