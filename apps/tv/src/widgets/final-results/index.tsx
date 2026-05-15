import type { LeaderboardEntry, ReactionEvent } from '@quizparty/shared';
import { soundFinal } from '@shared/assets/sounds';
import { s, sv } from '@shared/config/scale';
import { useMusicTrack } from '@shared/ui/music-provider';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { getFinalLeaderboard } from './model';
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
  const rest = sortedLeaderboard.slice(3, 8);

  useMusicTrack(soundFinal, false);
  const playersOpacity = useRef(new Animated.Value(0)).current;
  const playersSlide = useRef(new Animated.Value(48)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(3000),
      Animated.parallel([
        Animated.timing(playersOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.spring(playersSlide, {
          toValue: 0,
          friction: 9,
          tension: 90,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [playersOpacity, playersSlide]);

  return (
    <View style={[styles.root]}>
      <FinalConfetti screenHeight={height} />
      <FinalHeader />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: playersOpacity,
            transform: [{ translateY: playersSlide }],
          },
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
    justifyContent: 'flex-end',
    gap: s(16),
  },
});
