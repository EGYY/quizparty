/**
 * AnswerDot — одна анимированная точка игрока в полосе прогресса ответов.
 *
 * false → true : spring-поп при ответе игрока
 * true → false : сброс шкалы (новый вопрос)
 */
import { s } from '@shared/config/scale';
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

type Props = { isAnswered: boolean };

export const AnswerDot = memo(function AnswerDot({ isAnswered }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(isAnswered);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!prev.current && isAnswered) {
      prev.current = true;
      animRef.current?.stop();
      animRef.current = Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.6,
          friction: 4,
          tension: 260,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 160,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]);
      animRef.current.start();
    } else if (!isAnswered) {
      prev.current = false;
      animRef.current?.stop();
      scale.setValue(1);
    }
    return () => {
      animRef.current?.stop();
    };
  }, [isAnswered]);

  return (
    <Animated.View
      style={[
        styles.dot,
        isAnswered ? styles.dot_answered : styles.dot_waiting,
        { transform: [{ scale }] },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  dot: {
    width: s(18),
    height: s(18),
    borderRadius: s(9),
  },
  dot_answered: {
    backgroundColor: '#bff55b',
    shadowColor: '#bff55b',
    shadowOpacity: 0.7,
    shadowRadius: s(6),
    shadowOffset: { width: 0, height: 0 },
  },
  dot_waiting: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
});
