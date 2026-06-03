/**
 * QuestionOptionsGrid — сетка 2×2 вариантов ответа в фазе вопроса.
 *
 * Мемоизирован: перерисовывается только при смене questionId или videoMode.
 * Тики таймера НЕ вызывают перерисовку.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { QuestionOptionCard } from './question-option-card';

type Props = {
  options: string[];
  /** Используется только компаратором memo — не рендерится. */
  questionId: string;
  videoMode?: boolean;
};

export const QuestionOptionsGrid = memo(
  function QuestionOptionsGrid({ options, videoMode = false }: Props) {
    return (
      <View style={[styles.optionsGrid, videoMode && styles.optionsGrid_video]}>
        {options.slice(0, 4).map((option, index) => (
          <QuestionOptionCard
            key={index}
            index={index}
            option={option}
            videoMode={videoMode}
          />
        ))}
      </View>
    );
  },
  (prev, next) =>
    prev.questionId === next.questionId && prev.videoMode === next.videoMode,
);

const styles = StyleSheet.create({
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 10,
  },
  optionsGrid_video: {
    width: '92%',
    maxWidth: 1500,
  },
});
