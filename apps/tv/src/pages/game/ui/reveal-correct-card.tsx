import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { TvGameState } from '@entities/game';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';

type RevealState = Extract<TvGameState, { phase: 'reveal' }>;

function getCorrectAnswerStyle(text: string) {
  if (text.length > 95) return styles.correctAnswer_dense;
  if (text.length > 52) return styles.correctAnswer_long;
  return undefined;
}

function getExplanationStyle(text: string) {
  if (text.length > 220) return styles.correctExplanation_dense;
  if (text.length > 130) return styles.correctExplanation_long;
  return undefined;
}

export const RevealCorrectCard = memo(function RevealCorrectCard({
  correctAnswer,
  mediaCardH,
  mediaCardW,
  revealMedia,
  roundNumber,
  explanation,
}: {
  correctAnswer: string;
  explanation: string | undefined;
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
      style={[styles.correctCard, { transform: correctCardTransform }]}
    >
      {revealMedia ? (
        <>
          <TvMediaPlayer
            media={revealMedia}
            overrideWidth={mediaCardW}
            overrideHeight={Math.round(mediaCardH * 0.68)}
            variant="reveal"
          />
          <Text style={styles.correctLabel}>Правильный ответ:</Text>
          <Text style={[styles.correctAnswer, getCorrectAnswerStyle(correctAnswer)]}>
            {correctAnswer}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.correctStar}>★</Text>
          <Text style={styles.correctLabel}>Правильный ответ:</Text>
          <Text style={[styles.correctAnswer, getCorrectAnswerStyle(correctAnswer)]}>
            {correctAnswer}
          </Text>
          {explanation ? (
            <>
              <View style={styles.correctDivider} />
              <Text style={[styles.correctExplanation, getExplanationStyle(explanation)]}>
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
    width: '40%',
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(245, 255, 91, 0.76)',
    borderRadius: s(34),
    borderWidth: s(3),
    backgroundColor: 'rgba(28, 73, 31, 0.78)',
    overflow: 'hidden',
    paddingHorizontal: s(28),
    paddingVertical: sv(26),
    gap: s(10),
    shadowColor: '#f7ff68',
    shadowOpacity: 0.5,
    shadowRadius: s(28),
    shadowOffset: { width: 0, height: 0 },
  },
  correctStar: {
    color: colors.gold,
    fontSize: sf(72),
    lineHeight: sv(76),
    fontWeight: '900',
    textShadowColor: 'rgba(255, 229, 85, 0.86)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(24),
  },
  correctLabel: {
    color: '#cdf47c',
    fontSize: sf(26),
    fontWeight: '900',
    textAlign: 'center',
  },
  correctAnswer: {
    color: '#befe5d',
    fontSize: sf(52),
    lineHeight: sv(60),
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(190, 254, 93, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },
  correctAnswer_long: {
    fontSize: sf(42),
    lineHeight: sv(48),
  },
  correctAnswer_dense: {
    fontSize: sf(34),
    lineHeight: sv(40),
  },
  correctDivider: {
    width: '100%',
    height: sv(2),
    backgroundColor: 'rgba(255, 224, 168, 0.24)',
    marginVertical: sv(6),
  },
  correctExplanation: {
    color: colors.text,
    fontSize: sf(27),
    lineHeight: sv(30),
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'center',
  },
  correctExplanation_long: {
    fontSize: sf(23),
    lineHeight: sv(27),
  },
  correctExplanation_dense: {
    fontSize: sf(20),
    lineHeight: sv(24),
  },
});
