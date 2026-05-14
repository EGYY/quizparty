import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { LeaderboardEntry, ReactionEvent } from '@quizparty/shared';
import { getFinalLeaderboard } from './model';
import { FinalConfetti } from './ui/final-confetti';
import { FinalHeader } from './ui/final-header';
import { FinalHostActions } from './ui/final-host-actions';
import { FinalRating } from './ui/final-rating';
import { WinnersPodium } from './ui/podium';
import { soundFinal } from '@shared/assets/sounds';
import { useMusicTrack } from '@shared/ui/music-provider';

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
  const { height, width } = useWindowDimensions();
  const compact = width < 1500 || height < 820;
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
    <View style={[styles.root, compact && styles.root_compact]}>
      <FinalConfetti compact={compact} screenHeight={height} />
      <FinalHeader compact={compact} />

      <Animated.View
        style={[
          styles.content,
          compact && styles.content_compact,
          {
            opacity: playersOpacity,
            transform: [{ translateY: playersSlide }],
          },
        ]}
      >
        <WinnersPodium
          compact={compact}
          first={first}
          second={second}
          third={third}
        />
        <View style={[styles.side, compact && styles.side_compact]}>
          <FinalRating compact={compact} players={rest} />
          <FinalHostActions
            compact={compact}
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
    paddingHorizontal: 38,
    paddingBottom: 28,
  },
  root_compact: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 28,
    zIndex: 2,
  },
  content_compact: {
    gap: 18,
  },
  side: {
    flex: 1,
    minWidth: 500,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  side_compact: {
    minWidth: 360,
    gap: 10,
  },
});
