import { useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

export function useFinalResultsReveal() {
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

  return useMemo(
    () => ({
      opacity: playersOpacity,
      transform: [{ translateY: playersSlide }],
    }),
    [playersOpacity, playersSlide],
  );
}
