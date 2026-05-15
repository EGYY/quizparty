import { memo } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TVFocusGuideView,
  View,
} from 'react-native';
import { Difficulty, GameMode } from '@quizparty/shared';
import type { TvQuiz } from '@entities/quiz';
import {
  categoryIcons,
  categoryLabels,
  difficultyLabels,
  modeLabels,
} from '@shared/config/labels';
import { colors, radii, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import {
  LightningIcon,
  PartyPopperIcon,
  SignalBarsIcon,
  TrophyIcon,
} from '@shared/assets/icons';
import { getMediaUrl } from '@shared/lib/media';

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
    <TVFocusGuideView
      trapFocusUp
      trapFocusDown
      trapFocusLeft
      trapFocusRight
      style={styles.panelOuter}
    >
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
                source={{ uri: getMediaUrl(quiz.coverUrl) }}
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
                  size={s(30)}
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
                        <LightningIcon color={colors.blue} size={s(32)} />
                      ) : (
                        <TrophyIcon color={colors.blue} size={s(32)} />
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
            <PartyPopperIcon accentColor={colors.purple} size={s(74)} />
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
    </TVFocusGuideView>
  );
});

const styles = StyleSheet.create({
  // Outer wrapper: same size as the panel but NO overflow:hidden,
  // so tvOS focus engine can always reach the close button that lives here.
  panelOuter: {
    width: s(720),
    height: '100%',
  },

  // Inner panel: overflow:hidden ONLY for borderRadius + scroll clipping.
  panel: {
    flex: 1,
    borderColor: 'rgba(255, 248, 238, 0.18)',
    borderRadius: s(34),
    borderWidth: s(2),
    backgroundColor: 'rgba(24, 24, 49, 0.97)',
    shadowColor: '#000',
    shadowOpacity: 0.52,
    shadowRadius: s(36),
    shadowOffset: { width: s(-14), height: 0 },
    overflow: 'hidden',
  },

  // ── Close button ──
  // closeWrap owns position:absolute so the Pressable inside Focusable gets proper bounds.
  // (Focusable passes style to inner Animated.View, not to Pressable — so position:absolute
  //  must live on an outer plain View, not on Focusable's style prop.)
  closeWrap: {
    position: 'absolute',
    top: sv(18),
    right: s(18),
    zIndex: 10,
    width: s(56),
    height: s(56),
  },
  closeButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(28),
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: sf(20),
    fontWeight: '700',
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: s(28),
    paddingTop: sv(22),
    paddingBottom: sv(28),
    gap: s(16),
  },

  // ── Title ──
  titleBlock: {
    // leave space for the close button on the right
    paddingRight: s(66),
    gap: s(8),
  },
  title: {
    color: colors.text,
    fontSize: sf(36),
    fontWeight: '900',
    lineHeight: sv(42),
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: s(16),
    paddingVertical: sv(8),
  },
  categoryPillText: {
    color: colors.textSecondary,
    fontSize: sf(16),
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
    borderWidth: s(1),
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverIcon: {
    fontSize: sf(90),
  },

  // ── Description ──
  description: {
    color: colors.text,
    fontSize: sf(22),
    lineHeight: sv(31),
  },

  // ── Author + Stats ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(12),
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    borderRadius: radii.md,
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: s(16),
    paddingVertical: sv(12),
  },
  authorMark: {
    width: s(44),
    height: s(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.purple,
    borderRadius: s(22),
    borderWidth: s(2),
    backgroundColor: 'rgba(155, 124, 255, 0.16)',
  },
  authorMarkText: {
    color: colors.gold,
    fontSize: sf(18),
    fontWeight: '900',
  },
  authorLabel: {
    color: colors.textMuted,
    fontSize: sf(16),
    fontWeight: '800',
  },
  authorName: {
    color: colors.text,
    fontSize: sf(18),
    fontWeight: '900',
  },
  statGroup: {
    flexDirection: 'row',
    gap: s(10),
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    borderRadius: radii.md,
    borderWidth: s(1.5),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.065)',
    paddingHorizontal: s(14),
    paddingVertical: sv(12),
    minWidth: s(112),
  },
  statEmoji: {
    fontSize: sf(22),
  },
  statValue: {
    color: colors.text,
    fontSize: sf(20),
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: sf(13),
    fontWeight: '700',
  },

  // ── Mode ──
  section: {
    gap: s(8),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: sf(20),
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
    minHeight: sv(80),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    borderRadius: radii.md,
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    paddingHorizontal: s(18),
  },
  modeOptionActive: {
    borderColor: colors.blue,
    backgroundColor: 'rgba(94, 215, 255, 0.13)',
    shadowColor: colors.blue,
    shadowOpacity: 0.42,
    shadowRadius: s(16),
    shadowOffset: { width: 0, height: 0 },
  },
  modeTextBlock: {
    flex: 1,
    gap: s(4),
  },
  modeTitle: {
    color: colors.textSecondary,
    fontSize: sf(18),
    fontWeight: '900',
  },
  modeTitleActive: {
    color: colors.text,
  },
  modeDescription: {
    color: colors.textSecondary,
    fontSize: sf(16),
    lineHeight: sv(20),
  },

  // ── Primary button ──
  primary: {
    minHeight: sv(78),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(22),
    borderWidth: s(2),
    borderColor: 'rgba(255, 248, 238, 0.78)',
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOpacity: 0.76,
    shadowRadius: s(24),
    shadowOffset: { width: 0, height: 0 },
    marginTop: sv(12),
    flexDirection: 'row',
    gap: s(14),
  },
  primaryText: {
    color: colors.text,
    fontSize: sf(29),
    fontWeight: '900',
  },
});
