import { memo } from 'react';
import { Dimensions } from 'react-native';
import { Difficulty, GameMode } from '@quizparty/shared';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import {
  categoryIcons,
  categoryLabels,
  difficultyLabels,
  modeLabels,
} from '@shared/config/labels';
import { colors, radii, spacing } from '@shared/config/theme';
import { Focusable } from '@shared/ui/focusable';
import {
  LightningIcon,
  PartyPopperIcon,
  SignalBarsIcon,
  TrophyIcon,
} from '@shared/assets/icons';

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: colors.mint,
  [Difficulty.MEDIUM]: colors.gold,
  [Difficulty.HARD]: colors.red,
};

export const QuizDetailPanel = memo(function QuizDetailPanel({
  quiz,
  mode,
  isCreating,
  onBack,
  onCreateRoom,
  onModeChange,
}: {
  quiz: TvQuiz;
  mode: GameMode;
  isCreating: boolean;
  onBack: () => void;
  onCreateRoom: () => void;
  onModeChange: (mode: GameMode) => void;
}) {
  const canUseCover = Boolean(
    quiz.coverUrl &&
    !quiz.coverUrl.endsWith('.svg') &&
    !quiz.coverUrl.includes('assets.quizparty.local'),
  );
  const quizDifficulty = quiz.difficulty ?? Difficulty.MEDIUM;

  return (
    <View style={styles.panelOuter}>
      <View style={styles.panel}>
        {/*  Scrollable body  */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title + category */}
          <View style={styles.titleBlock}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {categoryIcons[quiz.category]} {categoryLabels[quiz.category]}
              </Text>
            </View>
            <Text numberOfLines={2} style={styles.title}>
              {quiz.title}
            </Text>
          </View>

          {/* Cover */}
          <View
            style={[
              styles.cover,
              { backgroundColor: quiz.themeColor ?? colors.purple },
            ]}
          >
            {canUseCover && quiz.coverUrl ? (
              <Image
                resizeMode="cover"
                source={{ uri: quiz.coverUrl }}
                style={styles.coverImage}
              />
            ) : (
              <Text style={styles.coverIcon}>
                {categoryIcons[quiz.category]}
              </Text>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={3}>
            {quiz.fullDescription ?? quiz.description}
          </Text>

          {/* Author + Stats */}
          <View style={styles.infoRow}>
            <View style={styles.author}>
              <View style={styles.authorMark}>
                <Text style={styles.authorMarkText}>Q+</Text>
              </View>
              <View>
                <Text style={styles.authorLabel}>Автор</Text>
                <Text style={styles.authorName}>{quiz.authorName}</Text>
              </View>
            </View>

            <View style={styles.statGroup}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🎯</Text>
                <View>
                  <Text style={styles.statValue}>{quiz.questionCount}</Text>
                  <Text style={styles.statLabel}>вопросов</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statCard,
                  { borderColor: `${difficultyColors[quizDifficulty]}55` },
                ]}
              >
                <SignalBarsIcon
                  size={30}
                  color={difficultyColors[quizDifficulty]}
                />
                <View>
                  <Text
                    style={[
                      styles.statValue,
                      { color: difficultyColors[quizDifficulty] },
                    ]}
                  >
                    {difficultyLabels[quizDifficulty]}
                  </Text>
                  <Text style={styles.statLabel}>сложность</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Game mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Режим игры</Text>
            <View style={styles.modeGrid}>
              {Object.values(GameMode).map(value => {
                const active = mode === value;
                return (
                  <View key={value} style={styles.modeWrapper}>
                    <Focusable
                      onPress={() => onModeChange(value)}
                      style={[
                        styles.modeOption,
                        active && styles.modeOptionActive,
                      ]}
                    >
                      {value === GameMode.FAST ? (
                        <LightningIcon color={colors.blue} size={32} />
                      ) : (
                        <TrophyIcon color={colors.blue} size={32} />
                      )}
                      <View style={styles.modeTextBlock}>
                        <Text
                          style={[
                            styles.modeTitle,
                            active && styles.modeTitleActive,
                          ]}
                        >
                          {modeLabels[value]} режим
                        </Text>
                        <Text style={styles.modeDescription}>
                          {value === GameMode.FAST
                            ? 'Быстрые вопросы, больше драйва!'
                            : 'Больше времени на размышление.'}
                        </Text>
                      </View>
                    </Focusable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Create room */}
          <Focusable
            hasTVPreferredFocus
            onPress={onCreateRoom}
            style={styles.primary}
            disabled={isCreating}
          >
            <PartyPopperIcon accentColor={colors.purple} size={64} />
            <Text style={styles.primaryText}>
              {isCreating ? 'Создаём комнату...' : 'Создать комнату'}
            </Text>
          </Focusable>
        </ScrollView>
      </View>

      {/* Close button - sibling of overflow:hidden panel, outer View owns position:absolute */}
      <View style={styles.closeWrap}>
        <Focusable onPress={onBack} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Focusable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Outer wrapper: same size as the panel but NO overflow:hidden,
  // so tvOS focus engine can always reach the close button that lives here.
  panelOuter: {
    width: 720,
    height: '100%',
  },

  // Inner panel: overflow:hidden ONLY for borderRadius + scroll clipping.
  panel: {
    flex: 1,
    borderColor: 'rgba(255, 248, 238, 0.18)',
    borderRadius: 34,
    borderWidth: 2,
    backgroundColor: 'rgba(24, 24, 49, 0.97)',
    shadowColor: '#000',
    shadowOpacity: 0.52,
    shadowRadius: 36,
    shadowOffset: { width: -14, height: 0 },
    overflow: 'hidden',
  },

  // ── Close button ──
  // closeWrap owns position:absolute so the Pressable inside Focusable gets proper bounds.
  // (Focusable passes style to inner Animated.View, not to Pressable — so position:absolute
  //  must live on an outer plain View, not on Focusable's style prop.)
  closeWrap: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    width: 56,
    height: 56,
  },
  closeButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '700',
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 16,
  },

  // ── Title ──
  titleBlock: {
    // leave space for the close button on the right
    paddingRight: 66,
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryPillText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },

  // ── Cover ──
  cover: {
    height: Dimensions.get('window').height / 2.6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverIcon: {
    fontSize: 90,
  },

  // ── Description ──
  description: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 31,
  },

  // ── Author + Stats ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.purple,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(155, 124, 255, 0.16)',
  },
  authorMarkText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  authorLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  authorName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  statGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.065)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 112,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Mode ──
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeWrapper: {
    flex: 1,
  },
  modeOption: {
    width: '100%',
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    paddingHorizontal: 18,
  },
  modeOptionActive: {
    borderColor: colors.blue,
    backgroundColor: 'rgba(94, 215, 255, 0.13)',
    shadowColor: colors.blue,
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  modeTextBlock: {
    flex: 1,
    gap: 4,
  },
  modeTitle: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '900',
  },
  modeTitleActive: {
    color: colors.text,
  },
  modeDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Primary button ──
  primary: {
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 248, 238, 0.78)',
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOpacity: 0.76,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    marginTop: 12,
    flexDirection: 'row',
    gap: 14,
  },
  primaryText: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '900',
  },
});
