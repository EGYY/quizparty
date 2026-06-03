/**
 * QuestionOptionCard — один вариант ответа в фазе вопроса.
 *
 * Не содержит состояния и анимации — чистый presentational компонент.
 * Мемоизация происходит на уровне QuestionOptionsGrid.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

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
  index: number;
  option: string;
  videoMode?: boolean;
};

export function QuestionOptionCard({
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
        videoMode && styles.optionCard_video,
      ]}
    >
      <View style={[styles.optionIndex]}>
        <Text style={[styles.optionIndexText]}>
          {String.fromCharCode(65 + index)}
        </Text>
      </View>
      <View style={styles.optionTextWrap}>
        <Text
          numberOfLines={videoMode ? 2 : 3}
          style={[styles.optionText, videoMode && styles.optionText_video]}
        >
          {option}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    width: '45%',
    minHeight: sv(154),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(24),
    borderRadius: s(20),
    borderWidth: s(3),
    paddingHorizontal: s(24),
    paddingVertical: sv(16),
    shadowColor: '#000000',
    shadowOpacity: 0.26,
    shadowRadius: s(14),
    shadowOffset: { width: 0, height: sv(8) },
  },
  optionCard_featured: {
    borderColor: '#c087ff',
    shadowColor: '#b174ff',
    shadowOpacity: 0.95,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
  },
  optionCard_video: {
    width: '47%',
    minHeight: 0,
    height: sv(104),
    paddingVertical: sv(10),
    paddingHorizontal: s(18),
    gap: s(16),
  },
  optionIndex: {
    width: s(74),
    height: s(74),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: s(37),
    borderWidth: s(4),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  optionIndexText: {
    color: colors.text,
    fontSize: sf(46),
    lineHeight: sv(54),
    fontWeight: '900',
  },
  optionTextWrap: { flex: 1, justifyContent: 'center' },
  optionText: {
    color: colors.text,
    fontSize: sf(35),
    lineHeight: sv(35),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.44)',
    textShadowOffset: { width: 0, height: sv(3) },
    textShadowRadius: s(3),
  },
  optionText_video: { fontSize: sf(32), lineHeight: sv(36) },
});
