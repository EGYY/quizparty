/**
 * QuestionVideoHero — полноэкранное медиа с оверлеем текста вопроса.
 *
 * Используется, когда у вопроса есть видео / аудио / изображение.
 * Мемоизирован по questionId — НЕ перерисовывается на тиках таймера.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Media } from '@quizparty/shared';
import { s, sf, sv } from '@shared/config/scale';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';

// Должно совпадать с горизонтальным padding внешнего контейнера (pages/game/index.tsx)
const GAME_PADDING_H = s(58);

type Props = {
  forcePaused?: boolean;
  media: Media;
  mediaH: number;
  questionId: string;
  questionText: string;
  screenWidth: number;
};

export const QuestionVideoHero = memo(
  function QuestionVideoHero({
    forcePaused,
    media,
    mediaH,
    questionText,
    screenWidth,
  }: Props) {
    const mediaWidth = Math.max(s(900), screenWidth - GAME_PADDING_H * 2);

    return (
      <View style={styles.wrapper}>
        <Text numberOfLines={2} style={styles.questionText}>
          {questionText}
        </Text>
        <TvMediaPlayer
          forcePaused={forcePaused}
          media={media}
          overrideWidth={mediaWidth}
          overrideHeight={mediaH}
          variant="question-av"
        />
      </View>
    );
  },
  (prev, next) =>
    prev.questionId === next.questionId &&
    prev.forcePaused === next.forcePaused &&
    prev.mediaH === next.mediaH &&
    prev.screenWidth === next.screenWidth,
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: sv(14),
  },
  questionText: {
    color: '#ffffff',
    fontSize: sf(46),
    lineHeight: sv(54),
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.92)',
    textShadowOffset: { width: 0, height: sv(3) },
    textShadowRadius: s(12),
  },
});
