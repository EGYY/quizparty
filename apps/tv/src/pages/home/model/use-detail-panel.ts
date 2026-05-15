import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing } from 'react-native';
import { GameMode } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { s } from '@shared/config/scale';

/** Off-screen X offset — panel slides in from the right */
const PANEL_OFFSET = s(760);

export function useDetailPanel() {
  const [detailQuiz, setDetailQuiz] = useState<QuizDetail | undefined>();
  const [detailMode, setDetailMode] = useState<GameMode>(GameMode.CLASSIC);

  const dimOpacity = useRef(new Animated.Value(0)).current;
  const panelX = useRef(new Animated.Value(PANEL_OFFSET)).current;
  const isClosing = useRef(false);

  const openQuiz = useCallback((quiz: QuizDetail) => {
    setDetailMode(GameMode.CLASSIC);
    setDetailQuiz(quiz);
  }, []);

  const closeDetail = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.parallel([
      Animated.timing(dimOpacity, {
        duration: 200,
        toValue: 0,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(panelX, {
        duration: 240,
        toValue: PANEL_OFFSET,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDetailQuiz(undefined);
      isClosing.current = false;
    });
  }, [dimOpacity, panelX]);

  // Open animation — soft spring slide-in + smooth dim
  useEffect(() => {
    if (!detailQuiz) return;

    dimOpacity.setValue(0);
    panelX.setValue(PANEL_OFFSET);

    Animated.parallel([
      Animated.timing(dimOpacity, {
        duration: 320,
        toValue: 1,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(panelX, {
        toValue: 0,
        damping: 32,
        mass: 0.85,
        stiffness: 130,
        useNativeDriver: true,
      }),
    ]).start();
  }, [detailQuiz, dimOpacity, panelX]);

  // Hardware back button
  useEffect(() => {
    if (!detailQuiz) return undefined;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDetail();
      return true;
    });

    return () => sub.remove();
  }, [closeDetail, detailQuiz]);

  return {
    detailQuiz,
    detailMode,
    setDetailMode,
    openQuiz,
    closeDetail,
    dimOpacity,
    panelX,
  };
}
