/**
 * RevealOptionCard — карточка варианта ответа на экране «раскрытия».
 *
 * Правильный вариант: зелёный фон, корона с анимацией покачивания.
 * Неправильный вариант: красный фон, крест.
 *
 * Мемоизирован — перерисовывается только при смене correctIndex.
 */
import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  correctIndex: number;
  index: number;
  option: string;
};

export const RevealOptionCard = memo(function RevealOptionCard({
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

  // Memoized: interpolate() creates a new AnimatedInterpolation node each call.
  // crownSpin is a stable ref, so this runs exactly once per card instance.
  const crownRotate = useMemo(
    () =>
      crownSpin.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-18deg', '-8deg', '2deg'],
      }),
    [crownSpin],
  );

  return (
    <Animated.View
      style={[
        styles.option,
        isCorrect ? styles.option_correct : styles.option_wrong,
      ]}
    >
      {isCorrect ? (
        <Animated.Text
          style={[styles.crown, { transform: [{ rotate: crownRotate }] }]}
        >
          👑
        </Animated.Text>
      ) : null}

      <View
        style={[
          styles.indexBadge,
          isCorrect ? styles.indexBadge_correct : styles.indexBadge_wrong,
        ]}
      >
        <Text style={[styles.indexText]}>
          {String.fromCharCode(65 + index)}
        </Text>
      </View>

      <View style={styles.textWrap}>
        <Text numberOfLines={2} style={[styles.optionText]}>
          {option}
        </Text>
      </View>

      <View
        style={[
          styles.resultIcon,
          isCorrect ? styles.resultIcon_correct : styles.resultIcon_wrong,
        ]}
      >
        <Text style={[styles.resultIconText]}>{isCorrect ? '✓' : '✕'}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  option: {
    width: '48%',
    minHeight: sv(110),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
    borderRadius: s(20),
    borderWidth: s(3),
    paddingHorizontal: s(18),
    paddingVertical: sv(14),
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: s(14),
    shadowOffset: { width: 0, height: sv(8) },
  },
  option_correct: {
    borderColor: '#d8ff96',
    backgroundColor: 'rgba(39, 126, 54, 0.84)',
    shadowColor: '#a9ff6d',
    shadowOpacity: 0.86,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
  },
  option_wrong: {
    borderColor: 'rgba(255, 101, 79, 0.62)',
    backgroundColor: 'rgba(84, 31, 34, 0.80)',
  },

  crown: {
    position: 'absolute',
    left: s(6),
    top: sv(-28),
    fontSize: sf(28),
    transform: [{ rotate: '-8deg' }],
  },

  indexBadge: {
    width: s(68),
    height: s(68),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(34),
    borderWidth: s(3),
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
    fontSize: sf(44),
    lineHeight: sv(52),
    fontWeight: '900',
  },

  textWrap: { flex: 1, justifyContent: 'center' },
  optionText: {
    color: colors.text,
    fontSize: sf(38),
    lineHeight: sv(46),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: sv(3) },
    textShadowRadius: s(4),
  },

  resultIcon: {
    width: s(50),
    height: s(50),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(25),
    borderWidth: s(3),
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
    fontSize: sf(30),
    lineHeight: sv(36),
    fontWeight: '900',
  },
});
