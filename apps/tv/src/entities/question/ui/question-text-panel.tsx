/**
 * QuestionTextPanel — панель с текстом вопроса + опциональное inline-медиа.
 *
 * Мемоизирован по questionId — НЕ перерисовывается на тиках таймера.
 * Анимация въезда перезапускается при смене questionId.
 */
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { Media } from '@quizparty/shared';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';
import { s, sf } from '@shared/config/scale';

type Props = {
  forcePaused?: boolean;
  media: Media | undefined;
  questionId: string;
  questionText: string;
};

export const QuestionTextPanel = memo(
  function QuestionTextPanel({
    forcePaused,
    media,
    questionId,
    questionText,
  }: Props) {
    const slideAnim = useRef(new Animated.Value(40)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      slideAnim.setValue(40);
      opacityAnim.setValue(0);

      const anim = Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 120,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]);
      anim.start();
      return () => anim.stop();
    }, [questionId]);

    return (
      <View style={[styles.heroRow]}>
        <Animated.View
          style={[
            styles.panel,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {media ? (
            <TvMediaPlayer
              forcePaused={forcePaused}
              media={media}
              variant="question"
            />
          ) : null}
          <Text numberOfLines={3} style={[styles.questionText]}>
            {questionText}
          </Text>
        </Animated.View>
      </View>
    );
  },
  (prev, next) =>
    prev.questionId === next.questionId &&
    prev.forcePaused === next.forcePaused,
);

const styles = StyleSheet.create({
  heroRow: {
    minHeight: s(350),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
  },
  panel: {
    flex: 1,
    minHeight: s(350),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 201, 119, 0.66)',
    borderRadius: 26,
    borderWidth: 3,
    backgroundColor: 'rgba(20, 20, 38, 0.92)',
    paddingHorizontal: 72,
    paddingVertical: 22,
  },
  questionText: {
    color: '#ffffff',
    fontSize: sf(58),
    lineHeight: 68,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
});
