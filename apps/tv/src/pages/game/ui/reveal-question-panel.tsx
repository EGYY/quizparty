import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

function getQuestionTextStyle(text: string) {
  if (text.length > 150) return styles.questionText_dense;
  if (text.length > 95) return styles.questionText_long;
  return undefined;
}

function getCorrectAnswerStyle(text: string) {
  if (text.length > 95) return styles.correctAnswer_dense;
  if (text.length > 54) return styles.correctAnswer_long;
  return undefined;
}

export const RevealQuestionPanel = memo(function RevealQuestionPanel({
  correctAnswer,
  hasMedia = false,
  questionText,
}: {
  correctAnswer: string;
  hasMedia?: boolean;
  questionText: string;
}) {
  return (
    <View
      style={[styles.questionPanel, hasMedia && styles.questionPanel_media]}
    >
      <Text style={styles.eyebrow}>Вопрос</Text>
      <Text style={[styles.questionText, getQuestionTextStyle(questionText)]}>
        {questionText}
      </Text>

      <View style={styles.answerHero}>
        <Text style={styles.correctLabel}>Правильный ответ</Text>
        <Text
          style={[styles.correctAnswer, getCorrectAnswerStyle(correctAnswer)]}
        >
          {correctAnswer}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  questionPanel: {
    width: '58%',
    alignSelf: 'stretch',
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    borderColor: 'rgba(255, 224, 168, 0.48)',
    borderRadius: s(34),
    borderWidth: s(3),
    backgroundColor: 'rgba(12, 15, 31, 0.9)',
    paddingHorizontal: s(44),
    paddingVertical: sv(34),
    gap: sv(18),
    shadowColor: '#000000',
    shadowOpacity: 0.32,
    shadowRadius: s(24),
    shadowOffset: { width: 0, height: sv(12) },
  },
  questionPanel_media: {
    width: '48%',
    paddingHorizontal: s(34),
  },
  eyebrow: {
    color: colors.gold,
    fontSize: sf(24),
    fontWeight: '900',
    letterSpacing: 1.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  questionText: {
    color: colors.text,
    fontSize: sf(52),
    lineHeight: sv(60),
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: sv(4) },
    textShadowRadius: s(5),
  },
  questionText_long: {
    fontSize: sf(42),
    lineHeight: sv(48),
  },
  questionText_dense: {
    fontSize: sf(34),
    lineHeight: sv(40),
  },
  answerHero: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(190, 254, 93, 0.82)',
    borderRadius: s(30),
    borderWidth: s(4),
    backgroundColor: 'rgba(43, 116, 48, 0.9)',
    paddingHorizontal: s(34),
    paddingVertical: sv(30),
    shadowColor: '#befe5d',
    shadowOpacity: 0.55,
    shadowRadius: s(28),
    shadowOffset: { width: 0, height: 0 },
  },
  correctLabel: {
    color: '#eaffbf',
    fontSize: sf(28),
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  correctAnswer: {
    color: '#ffffff',
    fontSize: sf(78),
    lineHeight: sv(88),
    fontWeight: '900',
    marginTop: sv(8),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.44)',
    textShadowOffset: { width: 0, height: sv(5) },
    textShadowRadius: s(8),
  },
  correctAnswer_long: {
    fontSize: sf(62),
    lineHeight: sv(72),
  },
  correctAnswer_dense: {
    fontSize: sf(48),
    lineHeight: sv(58),
  },
});
