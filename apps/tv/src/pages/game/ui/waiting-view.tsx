import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

const STEPS = ['3', '2', '1', '🚀'];
/** How long each step stays on screen (ms) */
const STEP_MS = 900;

export function WaitingView() {
  const [stepIndex, setStepIndex] = useState(0);

  // Label animation
  const labelScale = useRef(new Animated.Value(0.3)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  // Two expanding rings
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.8)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.55)).current;

  const playStep = useCallback(() => {
    // Reset
    labelScale.setValue(0.3);
    labelOpacity.setValue(0);
    ring1Scale.setValue(0.9);
    ring1Opacity.setValue(0.75);
    ring2Scale.setValue(0.9);
    ring2Opacity.setValue(0.45);

    Animated.parallel([
      // Label bounces in
      Animated.spring(labelScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      // Ring 1 expands and fades
      Animated.timing(ring1Scale, {
        toValue: 1.85,
        duration: STEP_MS - 80,
        useNativeDriver: true,
      }),
      Animated.timing(ring1Opacity, {
        toValue: 0,
        duration: STEP_MS - 80,
        useNativeDriver: true,
      }),
      // Ring 2 — slight delay, slower
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 2.3,
            duration: STEP_MS - 80,
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: STEP_MS - 80,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [
    labelScale,
    labelOpacity,
    ring1Scale,
    ring1Opacity,
    ring2Scale,
    ring2Opacity,
  ]);

  useEffect(() => {
    playStep();
    const id = setInterval(() => {
      setStepIndex(i => (i + 1) % STEPS.length);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [playStep]);

  // Re-trigger animation whenever the step changes
  useEffect(() => {
    playStep();
  }, [stepIndex, playStep]);

  const label = STEPS[stepIndex];
  const isRocket = label === '🚀';

  return (
    <View style={styles.root}>
      {/* Glow backdrop */}
      <View style={styles.glow} />

      <Text style={styles.eyebrow}>Игра начинается</Text>

      {/* Countdown circle */}
      <View style={styles.circleWrap}>
        {/* Pulsing rings */}
        <Animated.View
          style={[
            styles.ring,
            styles.ring1,
            {
              opacity: ring1Opacity,
              transform: [{ scale: ring1Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            {
              opacity: ring2Opacity,
              transform: [{ scale: ring2Scale }],
            },
          ]}
        />

        {/* Static base circle */}
        <View style={styles.circle}>
          <Animated.Text
            style={[
              isRocket ? styles.labelRocket : styles.labelNumber,
              {
                opacity: labelOpacity,
                transform: [{ scale: labelScale }],
              },
            ]}
          >
            {label}
          </Animated.Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Первый вопрос уже на подходе…</Text>

      {/* Decorative dots */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === stepIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = s(260);
const RING_SIZE = CIRCLE_SIZE + s(30);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(28),
  },

  glow: {
    position: 'absolute',
    width: s(560),
    height: s(560),
    borderRadius: s(280),
    backgroundColor: 'rgba(155, 124, 255, 0.08)',
    // no shadow — just a soft ambient fill
  },

  eyebrow: {
    color: colors.gold,
    fontSize: sf(30),
    fontWeight: '900',
    letterSpacing: s(3),
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 209, 102, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },

  // ── Rings ──
  circleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: RING_SIZE / 2,
    borderWidth: s(3),
  },
  ring1: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderColor: colors.gold,
  },
  ring2: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderColor: colors.purple,
  },

  // ── Circle ──
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 49, 0.94)',
    borderWidth: s(4),
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.65,
    shadowRadius: s(32),
    shadowOffset: { width: 0, height: 0 },
  },
  labelNumber: {
    color: colors.text,
    fontSize: sf(128),
    lineHeight: sv(140),
    fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(12),
  },
  labelRocket: {
    fontSize: sf(90),
    lineHeight: sv(108),
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: sf(26),
    fontWeight: '800',
  },

  // ── Step dots ──
  dots: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: sv(-8),
  },
  dot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  dotActive: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: s(8),
    shadowOffset: { width: 0, height: 0 },
  },
});
