/**
 * HostCharacter — анимированный персонаж-ведущий.
 *
 * Бобает вверх-вниз в зависимости от mood.
 * Опциональный prop `speech` рендерит речевой пузырь над головой персонажа.
 */
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import { hostPresenter } from '@shared/assets/images';
import { colors } from '@shared/config/theme';

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

  const translateY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, mood === 'party' ? -12 : -7],
  });

  const isRight = placement !== 'left';

  return (
    <Animated.View
      style={[
        styles.wrap,
        isRight ? styles.rightWrap : styles.leftWrap,
        placement === 'topRight' && { top: -120 },
        { transform: [{ translateY }] },
      ]}
    >
      {/* Речевой пузырь */}
      {speech ? (
        <View
          style={[
            styles.bubble,
            isRight ? styles.bubble_right : styles.bubble_left,
          ]}
        >
          <Text style={styles.bubbleText}>{speech}</Text>
          {/* Хвостик пузыря */}
          <View
            style={[
              styles.bubbleTail,
              isRight ? styles.bubbleTail_right : styles.bubbleTail_left,
            ]}
          />
        </View>
      ) : null}

      <Image
        resizeMode="contain"
        source={hostPresenter}
        style={[styles.image, placement === 'left' && styles.mirrored]}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: -36,
    width: 470,
    height: 840,
    // zIndex намеренно не задан: порядок отрисовки управляется
    // позицией в JSX-дереве — HostCharacter рендерится ДО content,
    // поэтому content (карусель) всегда рисуется поверх персонажа.
    // Внутри detailOverlay (zIndex: 20) персонаж появляется после dimLayer,
    // что даёт правильный порядок без хардкода.
  },
  rightWrap: { right: -14 },
  leftWrap: {
    left: -80,
    bottom: -92,
    width: 430,
    height: 760,
  },
  image: { width: '100%', height: '100%' },
  mirrored: { transform: [{ scaleX: -1 }] },

  // ── Речевой пузырь ──
  bubble: {
    position: 'absolute',
    maxWidth: 220,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 209, 102, 0.6)',
    backgroundColor: 'rgba(22, 20, 40, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 10,
  },
  bubble_right: {
    // Над головой персонажа (голова примерно в верхней четверти wrap)
    top: 140,
    right: 300,
  },
  bubble_left: {
    top: 80,
    left: 300,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 26,
    textAlign: 'center',
  },

  // Хвостик — треугольник (CSS border trick)
  bubbleTail: {
    position: 'absolute',
    bottom: -13,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(22, 20, 40, 0.96)',
  },
  bubbleTail_right: { right: 24 },
  bubbleTail_left: { left: 24 },
});
