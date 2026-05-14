/**
 * QuestionOptionCard — один вариант ответа в фазе вопроса.
 *
 * Не содержит состояния и анимации — чистый presentational компонент.
 * Мемоизация происходит на уровне QuestionOptionsGrid.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';

const optionThemeStyles = StyleSheet.create({
  red: {
    borderColor: '#ff9f78',
    backgroundColor: 'rgba(118, 43, 38, 0.82)',
  },
  blue: {
    borderColor: '#f0a649',
    backgroundColor: 'rgba(20, 53, 89, 0.86)',
  },
  green: {
    borderColor: '#e6b35b',
    backgroundColor: 'rgba(35, 84, 61, 0.84)',
  },
  amber: {
    borderColor: '#ffba55',
    backgroundColor: 'rgba(72, 59, 41, 0.86)',
  },
});

const OPTION_THEMES = [
  optionThemeStyles.red,
  optionThemeStyles.blue,
  optionThemeStyles.green,
  optionThemeStyles.amber,
] as const;

type Props = {
  compact: boolean;
  index: number;
  option: string;
  videoMode?: boolean;
};

export function QuestionOptionCard({
  compact,
  index,
  option,
  videoMode = false,
}: Props) {
  return (
    <View
      style={[
        styles.optionCard,
        OPTION_THEMES[index % OPTION_THEMES.length],
        index === 0 && styles.optionCard_featured,
        compact && styles.optionCard_compact,
        videoMode && styles.optionCard_video,
        videoMode && compact && styles.optionCard_video_compact,
      ]}
    >
      <View style={[styles.optionIndex, compact && styles.optionIndex_compact]}>
        <Text
          style={[
            styles.optionIndexText,
            compact && styles.optionIndexText_compact,
          ]}
        >
          {String.fromCharCode(65 + index)}
        </Text>
      </View>
      <View style={styles.optionTextWrap}>
        <Text
          numberOfLines={videoMode ? 2 : 3}
          style={[
            styles.optionText,
            compact && styles.optionText_compact,
            videoMode && styles.optionText_video,
          ]}
        >
          {option}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    width: '49%',
    minHeight: 154,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderRadius: 20,
    borderWidth: 3,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.26,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  optionCard_featured: {
    borderColor: '#c087ff',
    shadowColor: '#b174ff',
    shadowOpacity: 0.95,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  optionCard_compact: {
    minHeight: 104,
    gap: 18,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  optionCard_video: {
    width: '24%',
    minHeight: 0,
    height: 118,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionCard_video_compact: { height: 88, gap: 10 },

  optionIndex: {
    width: 74,
    height: 74,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 37,
    borderWidth: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  optionIndex_compact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  optionIndexText: {
    color: colors.text,
    fontSize: 46,
    lineHeight: 54,
    fontWeight: '900',
  },
  optionIndexText_compact: { fontSize: 34, lineHeight: 40 },

  optionTextWrap: { flex: 1, justifyContent: 'center' },
  optionText: {
    color: colors.text,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.44)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 3,
  },
  optionText_compact: { fontSize: 30, lineHeight: 36 },
  optionText_video: { fontSize: 28, lineHeight: 34 },
});
