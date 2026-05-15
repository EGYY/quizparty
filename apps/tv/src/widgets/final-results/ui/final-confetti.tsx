import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, type ViewStyle } from 'react-native';

const pieces = [
  {
    color: '#ffd166',
    delay: 0,
    duration: 4700,
    left: 64,
    rotate: '18deg',
    size: 'long',
  },
  {
    color: '#ff7a90',
    delay: 280,
    duration: 4200,
    left: 142,
    rotate: '-24deg',
    size: 'short',
  },
  {
    color: '#5ed7ff',
    delay: 620,
    duration: 5000,
    left: 226,
    rotate: '42deg',
    size: 'square',
  },
  {
    color: '#9b7cff',
    delay: 120,
    duration: 4500,
    left: 314,
    rotate: '-12deg',
    size: 'long',
  },
  {
    color: '#f4a261',
    delay: 840,
    duration: 5300,
    left: 418,
    rotate: '28deg',
    size: 'short',
  },
  {
    color: '#63e6be',
    delay: 430,
    duration: 4800,
    left: 524,
    rotate: '-36deg',
    size: 'long',
  },
  {
    color: '#ffd166',
    delay: 990,
    duration: 4300,
    left: 616,
    rotate: '12deg',
    size: 'square',
  },
  {
    color: '#ff7ac8',
    delay: 170,
    duration: 5100,
    left: 722,
    rotate: '-28deg',
    size: 'short',
  },
  {
    color: '#5ed7ff',
    delay: 710,
    duration: 4600,
    left: 830,
    rotate: '34deg',
    size: 'long',
  },
  {
    color: '#f36f4d',
    delay: 360,
    duration: 5400,
    left: 934,
    rotate: '-18deg',
    size: 'square',
  },
  {
    color: '#ffd166',
    delay: 1180,
    duration: 4900,
    left: 1036,
    rotate: '25deg',
    size: 'long',
  },
  {
    color: '#9b7cff',
    delay: 540,
    duration: 4400,
    left: 1142,
    rotate: '-42deg',
    size: 'short',
  },
  {
    color: '#63e6be',
    delay: 80,
    duration: 5200,
    left: 1248,
    rotate: '-18deg',
    size: 'square',
  },
  {
    color: '#ffd166',
    delay: 920,
    duration: 4700,
    left: 1348,
    rotate: '30deg',
    size: 'long',
  },
  {
    color: '#ff7a90',
    delay: 240,
    duration: 5600,
    left: 1452,
    rotate: '-14deg',
    size: 'short',
  },
  {
    color: '#5ed7ff',
    delay: 650,
    duration: 5000,
    left: 1558,
    rotate: '22deg',
    size: 'long',
  },
  {
    color: '#f4a261',
    delay: 1010,
    duration: 4500,
    left: 1664,
    rotate: '-32deg',
    size: 'square',
  },
  {
    color: '#ff7ac8',
    delay: 520,
    duration: 5350,
    left: 1774,
    rotate: '36deg',
    size: 'short',
  },
  {
    color: '#ffd166',
    delay: 1390,
    duration: 4950,
    left: 1880,
    rotate: '-20deg',
    size: 'long',
  },
  {
    color: '#63e6be',
    delay: 760,
    duration: 5200,
    left: 1960,
    rotate: '16deg',
    size: 'square',
  },
  {
    color: '#5ed7ff',
    delay: 1500,
    duration: 4400,
    left: 184,
    rotate: '-34deg',
    size: 'long',
  },
  {
    color: '#f36f4d',
    delay: 1740,
    duration: 5150,
    left: 476,
    rotate: '24deg',
    size: 'short',
  },
  {
    color: '#9b7cff',
    delay: 1910,
    duration: 4700,
    left: 768,
    rotate: '-16deg',
    size: 'square',
  },
  {
    color: '#ffd166',
    delay: 1660,
    duration: 5550,
    left: 1080,
    rotate: '32deg',
    size: 'long',
  },
  {
    color: '#ff7a90',
    delay: 2040,
    duration: 4600,
    left: 1370,
    rotate: '-30deg',
    size: 'short',
  },
  {
    color: '#63e6be',
    delay: 2160,
    duration: 5300,
    left: 1620,
    rotate: '20deg',
    size: 'square',
  },
] as const;

export function FinalConfetti({ screenHeight }: { screenHeight: number }) {
  return (
    <Animated.View pointerEvents="none" style={styles.layer}>
      {pieces.map((piece, index) => (
        <FallingConfetti
          key={`${piece.left}-${piece.delay}-${index}`}
          piece={piece}
          screenHeight={screenHeight}
        />
      ))}
    </Animated.View>
  );
}

function FallingConfetti({
  piece,
  screenHeight,
}: {
  piece: (typeof pieces)[number];
  screenHeight: number;
}) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fall.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(piece.delay),
        Animated.timing(fall, {
          duration: piece.duration,
          easing: Easing.linear,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
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
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
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
