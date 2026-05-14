import { Difficulty, QuizCategory, QuizStatus } from '@quizparty/shared';
import type { QuizDraft, QuizDraftQuestion } from '@quizparty/shared';
import { defaultCoverUrl } from '@shared/lib/assets';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export const emptyQuestion = (order: number): QuizDraftQuestion => ({
  questionText: '',
  options: ['', '', '', ''],
  order,
  correctIndex: 0,
});

export const createNewDraft = (): QuizDraft => ({
  title: 'Новый квиз',
  description: '',
  category: QuizCategory.CINEMA,
  difficulty: Difficulty.MEDIUM,
  status: QuizStatus.DRAFT,
  coverUrl: defaultCoverUrl,
  themeColor: '#ffb45f',
  recommendedPlayersMin: 2,
  recommendedPlayersMax: 10,
  estimatedMinutes: 10,
  tags: ['вечеринка'],
  questions: Array.from({ length: 5 }, (_, index) => emptyQuestion(index)),
  validation: [],
});

export function localValidation(draft: QuizDraft): QuizDraft['validation'] {
  return [
    {
      code: 'TITLE_EXISTS',
      label: 'Название заполнено',
      passed: draft.title.trim().length > 0,
      severity: 'ERROR',
    },
    {
      code: 'DESCRIPTION_EXISTS',
      label: 'Описание заполнено',
      passed: Boolean(draft.description?.trim()),
      severity: 'ERROR',
    },
    {
      code: 'COVER_EXISTS',
      label: 'Обложка загружена',
      passed: Boolean(draft.coverUrl),
      severity: 'ERROR',
    },
    {
      code: 'MIN_QUESTIONS',
      label: 'Минимум 5 вопросов',
      passed: draft.questions.length >= 5,
      severity: 'ERROR',
    },
    {
      code: 'FOUR_ANSWERS',
      label: 'У каждого вопроса 4 ответа',
      passed: draft.questions.every(
        (question) => question.options.length === 4 && question.options.every(Boolean),
      ),
      severity: 'ERROR',
    },
  ];
}
