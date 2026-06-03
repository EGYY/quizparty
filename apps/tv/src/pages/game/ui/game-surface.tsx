import { memo, useLayoutEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { ReactionEvent } from '@quizparty/shared';
import type { TvGameState } from '@entities/game';
import { FinalResults } from '@widgets/final-results';
import { QuestionView } from './question-view';
import { RevealView } from './reveal-view';
import { StartingView } from './starting-view';
import { WaitingView } from './waiting-view';

export const GameSurface = memo(function GameSurface({
  gameState,
  onChooseQuiz,
  onPlayAgain,
  reactions,
}: {
  gameState: TvGameState;
  onChooseQuiz: () => void;
  onPlayAgain: () => void;
  reactions: ReactionEvent[];
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(22)).current;
  const prevPhase = useRef<string | null>(null);
  const phaseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useLayoutEffect(() => {
    if (gameState.phase === prevPhase.current) return;
    prevPhase.current = gameState.phase;

    phaseAnimationRef.current?.stop();
    fadeAnim.setValue(0);
    slideAnim.setValue(22);

    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
        isInteraction: false,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 10,
        tension: 90,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]);

    phaseAnimationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished && phaseAnimationRef.current === animation) {
        phaseAnimationRef.current = null;
      }
    });

    return () => {
      animation.stop();
      if (phaseAnimationRef.current === animation) {
        phaseAnimationRef.current = null;
      }
    };
  }, [gameState.phase]);

  function renderContent() {
    if (gameState.phase === 'starting')
      return (
        <StartingView
          serverTime={gameState.event.serverTime}
          startsAt={gameState.event.startsAt}
        />
      );
    if (gameState.phase === 'question')
      return <QuestionView state={gameState} />;
    if (gameState.phase === 'reveal')
      return <RevealView reactions={reactions} state={gameState} />;
    if (gameState.phase === 'final')
      return (
        <FinalResults
          leaderboard={gameState.event.leaderboard}
          onChooseQuiz={onChooseQuiz}
          onPlayAgain={onPlayAgain}
          reactions={reactions}
        />
      );
    return <WaitingView />;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {renderContent()}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
