import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export const WAITING_STEPS = ['3', '2', '1', '🚀'] as const;
const STEP_MS = 900;

export function useWaitingCountdown() {
  const [stepIndex, setStepIndex] = useState(0);
  const labelScale = useRef(new Animated.Value(0.3)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.8)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.55)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const playStep = useCallback(() => {
    animationRef.current?.stop();

    labelScale.setValue(0.3);
    labelOpacity.setValue(0);
    ring1Scale.setValue(0.9);
    ring1Opacity.setValue(0.75);
    ring2Scale.setValue(0.9);
    ring2Opacity.setValue(0.45);

    const animation = Animated.parallel([
      Animated.spring(labelScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        isInteraction: false,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 140,
        isInteraction: false,
        useNativeDriver: true,
      }),
      Animated.timing(ring1Scale, {
        toValue: 1.85,
        duration: STEP_MS - 80,
        isInteraction: false,
        useNativeDriver: true,
      }),
      Animated.timing(ring1Opacity, {
        toValue: 0,
        duration: STEP_MS - 80,
        isInteraction: false,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 2.3,
            duration: STEP_MS - 80,
            isInteraction: false,
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: STEP_MS - 80,
            isInteraction: false,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished && animationRef.current === animation) {
        animationRef.current = null;
      }
    });
  }, [
    labelOpacity,
    labelScale,
    ring1Opacity,
    ring1Scale,
    ring2Opacity,
    ring2Scale,
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex(i => (i + 1) % WAITING_STEPS.length);
    }, STEP_MS);
    return () => {
      clearInterval(id);
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, []);

  useEffect(() => {
    playStep();
  }, [stepIndex, playStep]);

  const label = WAITING_STEPS[stepIndex];

  return {
    label,
    labelOpacity,
    labelScale,
    ring1Opacity,
    ring1Scale,
    ring2Opacity,
    ring2Scale,
    stepIndex,
  };
}
