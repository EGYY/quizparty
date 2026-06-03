import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { TvGameState } from '@entities/game';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';

type RevealState = Extract<TvGameState, { phase: 'reveal' }>;

function getExplanationStyle(text: string) {
  if (text.length > 220) return styles.correctExplanation_dense;
  if (text.length > 130) return styles.correctExplanation_long;
  return undefined;
}

export const RevealCorrectCard = memo(function RevealCorrectCard({
  mediaCardH,
  mediaCardW,
  forcePaused,
  revealMedia,
  roundNumber,
  explanation,
}: {
  explanation: string | undefined;
  forcePaused?: boolean;
  mediaCardH: number;
  mediaCardW: number;
  revealMedia: RevealState['roundEnd']['revealMedia'];
  roundNumber: number | undefined;
}) {
  const correctCardScale = useRef(new Animated.Value(0.72)).current;
  const correctCardTransform = useMemo(
    () => [{ scale: correctCardScale }],
    [correctCardScale],
  );

  useEffect(() => {
    correctCardScale.setValue(0.72);
    const cardAnim = Animated.sequence([
      Animated.delay(300),
      Animated.spring(correctCardScale, {
        toValue: 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]);
    cardAnim.start();
    return () => cardAnim.stop();
  }, [roundNumber, correctCardScale]);

  return (
    <Animated.View
      style={[
        styles.correctCard,
        revealMedia && styles.correctCard_media,
        { transform: correctCardTransform },
      ]}
    >
      {revealMedia ? (
        <>
          <TvMediaPlayer
            forcePaused={forcePaused}
            media={revealMedia}
            overrideWidth={mediaCardW}
            overrideHeight={Math.round(
              mediaCardH * (explanation ? 0.72 : 0.92),
            )}
            variant="reveal"
          />
          {explanation ? (
            <>
              <Text style={styles.correctLabel}>Разбор</Text>
              <Text
                style={[
                  styles.correctExplanation,
                  getExplanationStyle(explanation),
                ]}
              >
                {explanation}
              </Text>
            </>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.correctStar}>✓</Text>
          {explanation ? (
            <>
              <Text style={styles.correctLabel}>Разбор</Text>
              <Text
                style={[
                  styles.correctExplanation,
                  getExplanationStyle(explanation),
                ]}
              >
                {explanation}
              </Text>
            </>
          ) : null}
        </>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  correctCard: {
    alignSelf: 'stretch',
    width: '38%',
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(94, 215, 255, 0.54)',
    borderRadius: s(34),
    borderWidth: s(3),
    backgroundColor: 'rgba(8, 17, 34, 0.88)',
    overflow: 'hidden',
    paddingHorizontal: s(24),
    paddingVertical: sv(24),
    gap: sv(14),
    shadowColor: '#5ed7ff',
    shadowOpacity: 0.28,
    shadowRadius: s(24),
    shadowOffset: { width: 0, height: 0 },
  },
  correctCard_media: {
    width: '48%',
  },
  correctStar: {
    color: '#befe5d',
    fontSize: sf(150),
    lineHeight: sv(156),
    fontWeight: '900',
    textShadowColor: 'rgba(190, 254, 93, 0.76)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(28),
  },
  correctLabel: {
    color: colors.gold,
    fontSize: sf(24),
    fontWeight: '900',
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  correctExplanation: {
    color: colors.text,
    fontSize: sf(30),
    lineHeight: sv(36),
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'center',
  },
  correctExplanation_long: {
    fontSize: sf(25),
    lineHeight: sv(31),
  },
  correctExplanation_dense: {
    fontSize: sf(22),
    lineHeight: sv(27),
  },
});
