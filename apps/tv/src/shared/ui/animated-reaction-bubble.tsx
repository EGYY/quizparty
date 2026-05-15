import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import type { ReactionEvent } from '@quizparty/shared';
import { colors } from '@shared/config/theme';
import { s, sf } from '@shared/config/scale';
import { hashString } from '@shared/lib/hash-string';

export const AnimatedReactionBubble = memo(function AnimatedReactionBubble({
  reaction,
  range = 'default',
}: {
  reaction: ReactionEvent;
  range?: 'default' | 'finalHost';
}) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.78)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const placement = useMemo(() => {
    const seed = hashString(reaction.id);
    const config =
      range === 'finalHost' ? finalHostPlacement : defaultPlacement;

    return {
      right: config.rightMin + (seed % config.rightSpread),
      rotate: `${((seed >> 9) % 18) - 9}deg`,
      top: config.topMin + ((seed >> 4) % config.topSpread),
    };
  }, [range, reaction.id]);

  useEffect(() => {
    setVisible(true);
    opacity.setValue(0);
    scale.setValue(0.78);
    translateY.setValue(20);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 160,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          damping: 7,
          mass: 0.7,
          stiffness: 170,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(640),
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
          toValue: 0.78,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
          toValue: -18,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [opacity, reaction.id, scale, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bubble,
        {
          opacity,
          right: placement.right,
          top: placement.top,
          transform: [{ translateY }, { scale }, { rotate: placement.rotate }],
        },
      ]}
    >
      <Text style={styles.text}>{reaction.emoji}</Text>
    </Animated.View>
  );
});

const defaultPlacement = {
  rightMin: s(18),
  rightSpread: s(150),
  topMin: s(18),
  topSpread: s(430),
};

const finalHostPlacement = {
  rightMin: s(12),
  rightSpread: s(260),
  topMin: s(6),
  topSpread: s(210),
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    minWidth: s(80),
    minHeight: s(68),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: s(34),
    borderWidth: s(2),
    backgroundColor: 'rgba(66, 82, 126, 0.84)',
    paddingHorizontal: s(14),
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: s(14),
    shadowOffset: { width: 0, height: 0 },
  } satisfies ViewStyle,
  text: {
    fontSize: sf(40),
  },
});
