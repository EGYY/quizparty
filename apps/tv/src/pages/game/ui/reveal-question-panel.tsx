import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RevealOptionCard } from '@entities/question';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

function getQuestionTextStyle(text: string) {
  if (text.length > 150) return styles.questionText_dense;
  if (text.length > 95) return styles.questionText_long;
  return undefined;
}

export const RevealQuestionPanel = memo(function RevealQuestionPanel({
  correctIndex,
  options,
  questionText,
}: {
  correctIndex: number;
  options: string[];
  questionText: string;
}) {
  return (
    <View style={styles.questionPanel}>
      <Text style={[styles.questionText, getQuestionTextStyle(questionText)]}>
        {questionText}
      </Text>

      <View style={styles.optionsGrid}>
        {options.slice(0, 4).map((option, index) => (
          <RevealOptionCard
            correctIndex={correctIndex}
            index={index}
            key={`${option}-${index}`}
            option={option}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  questionPanel: {
    width: '50%',
    alignSelf: 'flex-start',
    flex: 1,
    minHeight: 0,
    borderColor: 'rgba(255, 201, 119, 0.52)',
    borderRadius: s(28),
    borderWidth: s(3),
    backgroundColor: 'rgba(18, 19, 36, 0.88)',
    paddingHorizontal: s(34),
    paddingTop: sv(28),
    paddingBottom: sv(24),
  },
  questionText: {
    color: colors.text,
    fontSize: sf(50),
    lineHeight: sv(58),
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: sv(4) },
    textShadowRadius: s(5),
    marginBottom: sv(4),
  },
  questionText_long: {
    fontSize: sf(42),
    lineHeight: sv(48),
  },
  questionText_dense: {
    fontSize: sf(34),
    lineHeight: sv(40),
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(14),
    justifyContent: 'center',
    marginTop: sv(30),
  },
});
