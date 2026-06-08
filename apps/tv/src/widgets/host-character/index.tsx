/**
 * HostCharacter — анимированный персонаж-ведущий.
 *
 * Бобает вверх-вниз в зависимости от mood.
 * Опциональный prop `speech` рендерит речевой пузырь над головой персонажа.
 */
import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import {
  hostQuizzyLobby,
  hostQuizzyThinking,
  hostQuizzyWelcome,
} from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  mood?: 'welcome' | 'thinking' | 'party';
  placement?: 'left' | 'right' | 'topRight';
  /** Текст в речевом пузыре над персонажем. Если не задан — пузырь не рендерится. */
  speech?: string;
};

export const HostCharacter = memo(function HostCharacter({
  placement = 'right',
  mood = 'welcome',
  speech,
}: Props) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          duration: mood === 'party' ? 900 : 1600,
          toValue: 1,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(bob, {
          duration: mood === 'party' ? 900 : 1600,
          toValue: 0,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [bob, mood]);

  // Memoized: interpolate() creates a new AnimatedInterpolation node each call.
  // Since bob is a stable ref and mood rarely changes, this memo prevents
  // unnecessary node creation on every parent re-render.
  const translateY = useMemo(
    () =>
      bob.interpolate({
        inputRange: [0, 1],
        outputRange: [0, mood === 'party' ? -12 : -7],
      }),
    [bob, mood],
  );

  const isRight = placement !== 'left';
  const isTopRight = placement === 'topRight';
  const hostSource =
    mood === 'thinking'
      ? hostQuizzyThinking
      : mood === 'party'
        ? hostQuizzyLobby
        : hostQuizzyWelcome;

  // Memoized: prevents a new array + object allocation on every parent re-render.
  // translateY is a stable AnimatedInterpolation (from useMemo above), so this
  // array only recreates when placement or mood changes.
  const wrapStyle = useMemo(
    () => [
      styles.wrap,
      isRight ? styles.rightWrap : styles.leftWrap,
      isTopRight ? styles.topRightWrap : undefined,
      { transform: [{ translateY }] },
    ],
    [isRight, isTopRight, translateY],
  );

  return (
    <Animated.View pointerEvents="none" style={wrapStyle}>
      {/* Речевой пузырь */}
      {speech ? (
        <View
          style={[
            styles.bubble,
            isTopRight
              ? styles.bubble_topRight
              : isRight
                ? styles.bubble_right
                : styles.bubble_left,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isTopRight ? styles.bubbleText_topRight : null,
            ]}
          >
            {speech}
          </Text>
        </View>
      ) : null}

      <Image
        resizeMode="contain"
        source={hostSource}
        style={[styles.image, placement === 'left' && styles.mirrored]}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: sv(-36),
    width: s(470),
    height: sv(840),
    // zIndex намеренно не задан: порядок отрисовки управляется
    // позицией в JSX-дереве — HostCharacter рендерится ДО content,
    // поэтому content (карусель) всегда рисуется поверх персонажа.
    // Внутри detailOverlay (zIndex: 20) персонаж появляется после dimLayer,
    // что даёт правильный порядок без хардкода.
  },
  rightWrap: { right: s(-14) },
  topRightWrap: {
    top: sv(34),
    right: s(92),
    bottom: undefined,
    width: s(230),
    height: sv(315),
  },
  leftWrap: {
    left: s(-80),
    bottom: sv(-92),
    width: s(430),
    height: sv(760),
  },
  image: { width: '100%', height: '100%' },
  mirrored: { transform: [{ scaleX: -1 }] },

  // ── Речевой пузырь ──
  bubble: {
    position: 'absolute',
    maxWidth: s(220),
    borderRadius: s(20),
    borderWidth: s(2),
    borderColor: 'rgba(255, 209, 102, 0.6)',
    backgroundColor: 'rgba(22, 20, 40, 0.96)',
    paddingHorizontal: s(16),
    paddingVertical: sv(13),
    ...Platform.select({
      android: { elevation: 6 },
      default: {
        shadowColor: colors.gold,
        shadowOpacity: 0.45,
        shadowRadius: s(16),
        shadowOffset: { width: 0, height: 0 },
      },
    }),
    zIndex: 10,
  },
  bubble_right: {
    // Над головой персонажа (голова примерно в верхней четверти wrap)
    top: sv(170),
    right: s(300),
  },
  bubble_topRight: {
    top: sv(4),
    right: s(170),
    maxWidth: s(230),
    borderRadius: s(15),
    paddingHorizontal: s(12),
    paddingVertical: sv(12),
  },
  bubble_left: {
    top: sv(100),
    left: s(300),
  },
  bubbleText: {
    color: colors.text,
    fontSize: sf(23),
    fontWeight: '900',
    lineHeight: sv(26),
    textAlign: 'center',
  },
  bubbleText_topRight: {
    fontSize: sf(23),
    lineHeight: sv(23),
  },
});
