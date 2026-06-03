import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  count: number;
  screenHeight: number;
  screenWidth: number;
};

export function AnswerCountdownOverlay({
  count,
  screenHeight,
  screenWidth,
}: Props) {
  const scaleAnim = useState(() => new Animated.Value(0.5))[0];

  useEffect(() => {
    scaleAnim.setValue(0.5);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [count, scaleAnim]);

  return (
    <View
      style={[
        styles.overlay,
        {
          height: screenHeight,
          width: screenWidth,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.Text
        style={[styles.countText, { transform: [{ scale: scaleAnim }] }]}
      >
        {count}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: -s(58),
    top: -sv(44),
    zIndex: 100,
    elevation: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFD166',
    fontSize: sf(220),
    fontWeight: '900',
    lineHeight: sv(260),
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: sv(6) },
    textShadowRadius: sf(24),
  },
});
