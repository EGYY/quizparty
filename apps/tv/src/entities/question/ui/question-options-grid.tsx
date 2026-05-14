/**
 * QuestionOptionsGrid — сетка 2×2 вариантов ответа в фазе вопроса.
 *
 * Мемоизирован: перерисовывается только при смене questionId, compact или videoMode.
 * Тики таймера НЕ вызывают перерисовку.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { QuestionOptionCard } from './question-option-card';

type Props = {
  compact: boolean;
  options: string[];
  /** Используется только компаратором memo — не рендерится. */
  questionId: string;
  videoMode?: boolean;
};

export const QuestionOptionsGrid = memo(
  function QuestionOptionsGrid({ compact, options, videoMode = false }: Props) {
    return (
      <View
        style={[
          styles.optionsGrid,
          videoMode && styles.optionsGrid_video,
          compact && styles.optionsGrid_compact,
        ]}
      >
        {options.slice(0, 4).map((option, index) => (
          <QuestionOptionCard
            key={index}
            compact={compact}
            index={index}
            option={option}
            videoMode={videoMode}
          />
        ))}
      </View>
    );
  },
  (prev, next) =>
    prev.questionId === next.questionId &&
    prev.compact === next.compact &&
    prev.videoMode === next.videoMode,
);

const styles = StyleSheet.create({
  optionsGrid: {
    width: '74%',
    maxWidth: 1240,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 10,
  },
  optionsGrid_compact: {
    width: '78%',
    gap: 10,
    marginTop: 6,
  },
  optionsGrid_video: {
    width: '98%',
    maxWidth: 1900,
  },
});
