/**
 * QuestionVideoHero — полноэкранное медиа с оверлеем текста вопроса.
 *
 * Используется, когда у вопроса есть видео / аудио / изображение.
 * Мемоизирован по questionId — НЕ перерисовывается на тиках таймера.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Media } from '@quizparty/shared';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';

// Должно совпадать с горизонтальным padding внешнего контейнера (pages/game/index.tsx)
const GAME_PADDING_H = 58;

type Props = {
  media: Media;
  mediaH: number;
  questionId: string;
  questionText: string;
  screenWidth: number;
};

export const QuestionVideoHero = memo(
  function QuestionVideoHero({
    media,
    mediaH,
    questionText,
    screenWidth,
  }: Props) {
    return (
      <View style={[styles.wrapper, { height: mediaH }]}>
        <TvMediaPlayer
          media={media}
          overrideWidth={screenWidth}
          overrideHeight={mediaH}
          variant="question-av"
        />
        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.overlayGradient} />
          <Text numberOfLines={2} style={[styles.overlayText]}>
            {questionText}
          </Text>
        </View>
      </View>
    );
  },
  (prev, next) => prev.questionId === next.questionId,
);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: -GAME_PADDING_H,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 60,
    paddingBottom: 30,
    paddingTop: 40,
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.92)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
});
