import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Difficulty, GameMode, QuizCategory } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { useCreateRoom } from '@features/create-room';
import { HostCharacter } from '@widgets/host-character';
import { RemoteHints } from '@widgets/remote-hints';
import { CategoryRail } from '@widgets/category-rail';
import { QuizCarousel } from '@widgets/quiz-carousel';
import { QuizDetailPanel } from '@widgets/quiz-detail-panel';
import { StageBackground } from '@widgets/stage-background';
import { fallbackQuizzes } from '@entities/quiz';
import { listApprovedQuizzes } from '@shared/api/tv';
import { quizPartyLogo } from '@shared/assets/images';
import { soundMainTheme } from '@shared/assets/sounds';
import { colors, spacing } from '@shared/config/theme';
import { useAsyncResource } from '@shared/lib/use-async-resource';
import { useMusicTrack } from '@shared/ui/music-provider';
import { PageState } from '@shared/ui/page-state';
import { Screen } from '@shared/ui/screen';

export function HomePage() {
  useMusicTrack(soundMainTheme);
  const { create: createDetailRoom, isCreating } = useCreateRoom();
  const [category, setCategory] = useState(QuizCategory.ALL);
  const [detailQuiz, setDetailQuiz] = useState<QuizDetail>();
  const [detailMode, setDetailMode] = useState<GameMode>(GameMode.CLASSIC);
  const dimOpacity = useRef(new Animated.Value(0)).current;
  const panelX = useRef(new Animated.Value(760)).current;
  const isClosing = useRef(false);
  const quizzes = useAsyncResource(
    () => listApprovedQuizzes(category),
    [category],
  );
  const data = quizzes.data?.length
    ? quizzes.data
    : quizzes.error
      ? fallbackQuizzes
      : [];
  const visibleQuizzes = useMemo(
    () =>
      category === QuizCategory.ALL
        ? data
        : data.filter(quiz => quiz.category === category),
    [category, data],
  );
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetail | undefined>();

  const openQuiz = useCallback((quiz: QuizDetail) => {
    setDetailMode(GameMode.CLASSIC);
    setDetailQuiz(quiz);
  }, []);
  const closeDetail = useCallback(() => {
    if (!detailQuiz || isClosing.current) return;
    isClosing.current = true;
    Animated.parallel([
      Animated.timing(dimOpacity, {
        duration: 160,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(panelX, {
        duration: 180,
        toValue: 760,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDetailQuiz(undefined);
      isClosing.current = false;
    });
  }, [detailQuiz, dimOpacity, panelX]);
  const selected = selectedQuiz ?? visibleQuizzes[0];

  useEffect(() => {
    if (!detailQuiz) return;
    dimOpacity.setValue(0);
    panelX.setValue(760);
    Animated.parallel([
      Animated.timing(dimOpacity, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(panelX, {
        damping: 24,
        mass: 0.9,
        stiffness: 180,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [detailQuiz, dimOpacity, panelX]);

  useEffect(() => {
    if (!detailQuiz) return undefined;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeDetail();
        return true;
      },
    );

    return () => subscription.remove();
  }, [closeDetail, detailQuiz]);

  return (
    <Screen>
      <StageBackground>
        {/* HostCharacter стоит ПЕРЕД content — рисуется раньше,
            поэтому QuizCarousel и вся карусель перекрывают его сверху.
            При открытом detailQuiz персонаж рендерится внутри
            detailOverlay (zIndex: 20) и там уже поверх контента. */}
        {!detailQuiz ? (
          <HostCharacter
            mood="welcome"
            placement="topRight"
            speech="Для начала выберите квиз!"
          />
        ) : null}
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Image
                resizeMode="contain"
                source={quizPartyLogo}
                style={styles.logo}
              />
              <Text style={styles.subtitle}>
                Выберите квиз для вечеринки 🎉
              </Text>
            </View>
          </View>

          <CategoryRail selected={category} onSelect={setCategory} />

          {quizzes.isLoading ? (
            <PageState
              title="Загружаем квизы"
              message="Подтягиваем одобренные подборки с backend."
            />
          ) : null}
          {quizzes.error && !visibleQuizzes.length ? (
            <PageState
              actionLabel="Повторить"
              message="Backend недоступен или вернул ошибку. Проверьте сервер и попробуйте еще раз."
              title="Не удалось загрузить квизы"
              onAction={quizzes.refetch}
            />
          ) : null}
          {visibleQuizzes.length ? (
            <>
              {quizzes.error ? (
                <Text style={styles.offlineNote}>
                  Backend недоступен, показаны локальные демо-квизы.
                </Text>
              ) : null}
              <QuizCarousel
                quizzes={visibleQuizzes}
                selectedQuizId={selected?.id}
                onFocusQuiz={setSelectedQuiz}
                onOpenQuiz={openQuiz}
              />
            </>
          ) : null}
        </View>
        {detailQuiz ? (
          <View pointerEvents="box-none" style={styles.detailOverlay}>
            <Animated.View
              pointerEvents="none"
              style={[styles.dimLayer, { opacity: dimOpacity }]}
            />
            <HostCharacter
              mood="thinking"
              speech="Отлично! Осталось выбрать режим игры"
              placement="left"
            />
            <Animated.View
              style={[
                styles.panelWrap,
                { transform: [{ translateX: panelX }] },
              ]}
            >
              <QuizDetailPanel
                isCreating={isCreating}
                mode={detailMode}
                quiz={detailQuiz}
                onBack={closeDetail}
                onCreateRoom={() => {
                  if (detailQuiz) {
                    void createDetailRoom({
                      difficulty: detailQuiz.difficulty ?? Difficulty.MEDIUM,
                      mode: detailMode,
                      quiz: detailQuiz,
                    });
                  }
                }}
                onModeChange={setDetailMode}
              />
            </Animated.View>
          </View>
        ) : null}
        <RemoteHints
        // hints={['← → категории и квизы', 'OK открыть', 'Back назад']}
        />
      </StageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 58,
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: {
    width: 400,
    height: 152,
    marginLeft: -20,
    marginBottom: -16,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 18,
    marginBottom: 4,
  },
  offlineNote: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(3, 5, 18, 0.68)',
  },
  panelWrap: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    top: 24,
    width: 720,
    zIndex: 30,
  },
});
