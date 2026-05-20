import { memo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { confettiPieces } from '../model/confetti';
import { FallingConfetti } from './falling-confetti';

export const FinalConfetti = memo(function FinalConfetti({
  screenHeight,
}: {
  screenHeight: number;
}) {
  return (
    <Animated.View pointerEvents="none" style={styles.layer}>
      {confettiPieces.map((piece, index) => (
        <FallingConfetti
          key={`${piece.left}-${piece.delay}-${index}`}
          piece={piece}
          screenHeight={screenHeight}
        />
      ))}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
