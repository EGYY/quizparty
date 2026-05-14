/**
 * RevealOptionCard — карточка варианта ответа на экране «раскрытия».
 *
 * Правильный вариант: зелёный фон, корона с анимацией покачивания.
 * Неправильный вариант: красный фон, крест.
 *
 * Мемоизирован — перерисовывается только при смене correctIndex или compact.
 */
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';

type Props = {
  compact: boolean;
  correctIndex: number;
  index: number;
  option: string;
};

export const RevealOptionCard = memo(function RevealOptionCard({
  compact,
  correctIndex,
  index,
  option,
}: Props) {
  const isCorrect = index === correctIndex;
  const crownSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCorrect) return;

    const anim = Animated.sequence([
      Animated.delay(index * 70 + 420),
      Animated.loop(
        Animated.sequence([
          Animated.timing(crownSpin, {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.timing(crownSpin, {
            toValue: -1,
            duration: 520,
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.timing(crownSpin, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.delay(1800),
        ]),
      ),
    ]);

    anim.start();
    return () => anim.stop();
  }, []);

  const crownRotate = crownSpin.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '-8deg', '2deg'],
  });

  return (
    <Animated.View
      style={[
        styles.option,
        isCorrect ? styles.option_correct : styles.option_wrong,
        compact && styles.option_compact,
      ]}
    >
      {isCorrect ? (
        <Animated.Text
          style={[
            styles.crown,
            compact && styles.crown_compact,
            { transform: [{ rotate: crownRotate }] },
          ]}
        >
          👑
        </Animated.Text>
      ) : null}

      <View
        style={[
          styles.indexBadge,
          isCorrect ? styles.indexBadge_correct : styles.indexBadge_wrong,
          compact && styles.indexBadge_compact,
        ]}
      >
        <Text style={[styles.indexText, compact && styles.indexText_compact]}>
          {String.fromCharCode(65 + index)}
        </Text>
      </View>

      <View style={styles.textWrap}>
        <Text
          numberOfLines={2}
          style={[styles.optionText, compact && styles.optionText_compact]}
        >
          {option}
        </Text>
      </View>

      <View
        style={[
          styles.resultIcon,
          isCorrect ? styles.resultIcon_correct : styles.resultIcon_wrong,
          compact && styles.resultIcon_compact,
        ]}
      >
        <Text
          style={[
            styles.resultIconText,
            compact && styles.resultIconText_compact,
          ]}
        >
          {isCorrect ? '✓' : '✕'}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  option: {
    width: '48%',
    minHeight: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    borderWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  option_compact: {
    minHeight: 80,
    gap: 11,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  option_correct: {
    borderColor: '#d8ff96',
    backgroundColor: 'rgba(39, 126, 54, 0.84)',
    shadowColor: '#a9ff6d',
    shadowOpacity: 0.86,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  option_wrong: {
    borderColor: 'rgba(255, 101, 79, 0.62)',
    backgroundColor: 'rgba(84, 31, 34, 0.80)',
  },

  crown: {
    position: 'absolute',
    left: 6,
    top: -28,
    fontSize: 28,
    transform: [{ rotate: '-8deg' }],
  },
  crown_compact: { fontSize: 22, top: -22 },

  indexBadge: {
    width: 68,
    height: 68,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    borderWidth: 3,
  },
  indexBadge_compact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  indexBadge_correct: {
    borderColor: '#beff72',
    backgroundColor: 'rgba(158, 220, 89, 0.34)',
  },
  indexBadge_wrong: {
    borderColor: '#ff7968',
    backgroundColor: 'rgba(243, 99, 77, 0.32)',
  },
  indexText: {
    color: colors.text,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '900',
  },
  indexText_compact: { fontSize: 30, lineHeight: 36 },

  textWrap: { flex: 1, justifyContent: 'center' },
  optionText: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  optionText_compact: { fontSize: 26, lineHeight: 32 },

  resultIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    borderWidth: 3,
  },
  resultIcon_compact: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
  },
  resultIcon_correct: {
    borderColor: '#beff72',
    backgroundColor: 'rgba(158, 220, 89, 0.28)',
  },
  resultIcon_wrong: {
    borderColor: '#ff6555',
    backgroundColor: 'rgba(243, 99, 77, 0.18)',
  },
  resultIconText: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  resultIconText_compact: { fontSize: 22, lineHeight: 28 },
});
