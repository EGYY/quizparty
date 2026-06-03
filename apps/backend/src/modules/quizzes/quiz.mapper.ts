import {
  MediaType,
  QuizCard,
  QuizCategory,
  QuizDetail,
  QuizDraft,
  QuizDraftQuestion,
  QuizStatus,
  ValidationChecklistItem,
} from '@quizparty/shared';

type AuthorRecord = {
  id: string;
  email?: string;
  displayName: string;
  role?: string;
  avatarUrl?: string | null;
};

type QuestionRecord = {
  id: string;
  quizId: string;
  questionText: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaAlt?: string | null;
  mediaStartMs?: number | null;
  mediaEndMs?: number | null;
  mediaPosterUrl?: string | null;
  mediaPrompt?: string | null;
  revealMediaUrl?: string | null;
  revealMediaType?: string | null;
  revealMediaAlt?: string | null;
  revealMediaStartMs?: number | null;
  revealMediaEndMs?: number | null;
  revealMediaPosterUrl?: string | null;
  revealMediaPrompt?: string | null;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  order: number;
};

type QuizRecord = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  status: string;
  coverUrl?: string | null;
  squareCoverUrl?: string | null;
  themeColor?: string | null;
  recommendedPlayersMin?: number | null;
  recommendedPlayersMax?: number | null;
  estimatedMinutes?: number | null;
  tags: string[];
  author?: AuthorRecord;
  questions?: QuestionRecord[];
  rating?: number | null;
  playCount?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    questions: number;
  };
};

export function mapQuizCard(quiz: QuizRecord): QuizCard {
  return {
    id: quiz.id,
    title: quiz.title,
    ...(quiz.description ? { description: quiz.description } : {}),
    category: quiz.category as QuizCategory,
    difficulty: quiz.difficulty as QuizCard['difficulty'],
    status: quiz.status as QuizStatus,
    ...(quiz.coverUrl ? { coverUrl: quiz.coverUrl } : {}),
    ...(quiz.squareCoverUrl ? { squareCoverUrl: quiz.squareCoverUrl } : {}),
    ...(quiz.themeColor ? { themeColor: quiz.themeColor } : {}),
    authorName: quiz.author?.displayName ?? 'QuizParty',
    questionCount: quiz._count?.questions ?? quiz.questions?.length ?? 0,
    ...(quiz.estimatedMinutes ? { estimatedMinutes: quiz.estimatedMinutes } : {}),
    ...(quiz.recommendedPlayersMin ? { recommendedPlayersMin: quiz.recommendedPlayersMin } : {}),
    ...(quiz.recommendedPlayersMax ? { recommendedPlayersMax: quiz.recommendedPlayersMax } : {}),
    ...(quiz.rating ? { rating: quiz.rating } : {}),
    ...(typeof quiz.playCount === 'number' ? { playCount: quiz.playCount } : {}),
    tags: quiz.tags,
  };
}

export function mapQuizDetail(quiz: QuizRecord): QuizDetail {
  return {
    ...mapQuizCard(quiz),
    ...(quiz.description ? { fullDescription: quiz.description } : {}),
    createdAt: (quiz.createdAt ?? new Date()).toISOString(),
    updatedAt: (quiz.updatedAt ?? new Date()).toISOString(),
  };
}

export function mapQuestion(question: QuestionRecord): QuizDraftQuestion {
  return {
    id: question.id,
    quizId: question.quizId,
    questionText: question.questionText,
    ...(question.mediaUrl && question.mediaType
      ? {
          media: {
            url: question.mediaUrl,
            type: question.mediaType as MediaType,
            ...(question.mediaAlt ? { alt: question.mediaAlt } : {}),
            ...(typeof question.mediaStartMs === 'number'
              ? { startMs: question.mediaStartMs }
              : {}),
            ...(typeof question.mediaEndMs === 'number' ? { endMs: question.mediaEndMs } : {}),
            ...(question.mediaPosterUrl ? { posterUrl: question.mediaPosterUrl } : {}),
            ...(question.mediaPrompt ? { prompt: question.mediaPrompt } : {}),
          },
        }
      : {}),
    ...(question.revealMediaUrl && question.revealMediaType
      ? {
          revealMedia: {
            url: question.revealMediaUrl,
            type: question.revealMediaType as MediaType,
            ...(question.revealMediaAlt ? { alt: question.revealMediaAlt } : {}),
            ...(typeof question.revealMediaStartMs === 'number'
              ? { startMs: question.revealMediaStartMs }
              : {}),
            ...(typeof question.revealMediaEndMs === 'number'
              ? { endMs: question.revealMediaEndMs }
              : {}),
            ...(question.revealMediaPosterUrl ? { posterUrl: question.revealMediaPosterUrl } : {}),
            ...(question.revealMediaPrompt ? { prompt: question.revealMediaPrompt } : {}),
          },
        }
      : {}),
    options: question.options,
    order: question.order,
    correctIndex: question.correctIndex,
    ...(question.explanation ? { explanation: question.explanation } : {}),
  };
}

export function mapQuizDraft(quiz: QuizRecord): QuizDraft {
  return {
    id: quiz.id,
    title: quiz.title,
    ...(quiz.description ? { description: quiz.description } : {}),
    category: quiz.category as QuizCategory,
    difficulty: quiz.difficulty as QuizCard['difficulty'],
    status: quiz.status as QuizStatus,
    ...(quiz.coverUrl ? { coverUrl: quiz.coverUrl } : {}),
    ...(quiz.themeColor ? { themeColor: quiz.themeColor } : {}),
    ...(quiz.recommendedPlayersMin ? { recommendedPlayersMin: quiz.recommendedPlayersMin } : {}),
    ...(quiz.recommendedPlayersMax ? { recommendedPlayersMax: quiz.recommendedPlayersMax } : {}),
    ...(quiz.estimatedMinutes ? { estimatedMinutes: quiz.estimatedMinutes } : {}),
    tags: quiz.tags,
    questions: (quiz.questions ?? []).sort((a, b) => a.order - b.order).map(mapQuestion),
    validation: validateQuizDraft(quiz),
    updatedAt: (quiz.updatedAt ?? new Date()).toISOString(),
  };
}

export function validateQuizDraft(quiz: QuizRecord): ValidationChecklistItem[] {
  const questions = quiz.questions ?? [];
  const everyQuestionHasFourAnswers = questions.every(
    (question) => question.options.length >= 2 && question.options.length <= 4,
  );
  const everyQuestionHasCorrectAnswer = questions.every(
    (question) => question.correctIndex >= 0 && question.correctIndex < question.options.length,
  );

  return [
    {
      code: 'TITLE_EXISTS',
      label: 'Название заполнено',
      passed: quiz.title.trim().length > 0,
      severity: 'ERROR',
    },
    {
      code: 'DESCRIPTION_EXISTS',
      label: 'Описание заполнено',
      passed: Boolean(quiz.description?.trim()),
      severity: 'ERROR',
    },
    {
      code: 'COVER_EXISTS',
      label: 'Обложка загружена',
      passed: Boolean(quiz.coverUrl),
      severity: 'ERROR',
    },
    {
      code: 'MIN_QUESTIONS',
      label: 'Минимум 5 вопросов',
      passed: questions.length >= 5,
      severity: 'ERROR',
    },
    {
      code: 'FOUR_ANSWERS',
      label: 'У каждого вопроса 2–4 варианта ответа',
      passed: everyQuestionHasFourAnswers,
      severity: 'ERROR',
    },
    {
      code: 'CORRECT_ANSWER',
      label: 'Правильные ответы выбраны',
      passed: everyQuestionHasCorrectAnswer,
      severity: 'ERROR',
    },
    {
      code: 'CATEGORY_SELECTED',
      label: 'Категория выбрана',
      passed: Boolean(quiz.category),
      severity: 'ERROR',
    },
    {
      code: 'DIFFICULTY_SELECTED',
      label: 'Сложность указана',
      passed: Boolean(quiz.difficulty),
      severity: 'ERROR',
    },
  ];
}
