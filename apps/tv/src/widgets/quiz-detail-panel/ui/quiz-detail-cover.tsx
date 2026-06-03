import { memo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { categoryIcons } from '@shared/config/labels';
import { colors, radii } from '@shared/config/theme';
import { s, sf } from '@shared/config/scale';
import { getMediaUrl } from '@shared/lib/media';

export const QuizDetailCover = memo(function QuizDetailCover({
  quiz,
}: {
  quiz: TvQuiz;
}) {
  const { height } = useWindowDimensions();
  const coverHeight = Math.round(height * 0.26);
  const canUseCover = Boolean(
    quiz.coverUrl &&
    !quiz.coverUrl.endsWith('.svg') &&
    !quiz.coverUrl.includes('assets.quizparty.local'),
  );

  return (
    <View
      style={[
        styles.cover,
        { height: coverHeight },
        { backgroundColor: quiz.themeColor ?? colors.purple },
      ]}
    >
      {canUseCover && quiz.coverUrl ? (
        <Image
          resizeMode="cover"
          source={{ uri: getMediaUrl(quiz.coverUrl) }}
          style={styles.coverImage}
        />
      ) : (
        <Text style={styles.coverIcon}>{categoryIcons[quiz.category]}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cover: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: s(1),
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverIcon: {
    fontSize: sf(90),
  },
});
