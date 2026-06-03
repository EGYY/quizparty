import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, type ViewStyle } from 'react-native';
import type { ConfettiPiece } from '../model/confetti';

export const FallingConfetti = memo(function FallingConfetti({
  piece,
  screenHeight,
}: {
  piece: ConfettiPiece;
  screenHeight: number;
}) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let stopped = false;
    let animation: Animated.CompositeAnimation | undefined;

    const runFall = () => {
      fall.setValue(0);
      animation = Animated.sequence([
        Animated.delay(piece.delay),
        Animated.timing(fall, {
          duration: piece.duration,
          easing: Easing.linear,
          isInteraction: false,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]);
      animation.start(({ finished }) => {
        if (finished && !stopped) {
          runFall();
        }
      });
    };

    runFall();

    return () => {
      stopped = true;
      animation?.stop();
    };
  }, [fall, piece.delay, piece.duration]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, screenHeight + 120],
  });
  const drift = fall.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, piece.left % 2 === 0 ? 34 : -34, 0],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        piece.size === 'square' && styles.piece_square,
        piece.size === 'short' && styles.piece_short,
        {
          backgroundColor: piece.color,
          left: piece.left,
          transform: [
            { translateX: drift },
            { translateY },
            { rotate: piece.rotate },
          ],
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 34,
    borderRadius: 4,
    opacity: 0.95,
  } satisfies ViewStyle,
  piece_square: {
    width: 20,
    height: 20,
  },
  piece_short: {
    height: 24,
  },
});
