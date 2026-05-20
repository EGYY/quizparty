import type { QuizDraft } from '@quizparty/shared';
import type { DraftErrors } from '../model/types';

export const EMPTY_ERRORS: DraftErrors = {
  title: undefined,
  description: undefined,
  cover: undefined,
  questions: [],
};

export function computeErrors(draft: QuizDraft): DraftErrors {
  return {
    title: draft.title.trim() ? undefined : 'Введите название',
    description: draft.description?.trim() ? undefined : 'Добавьте описание',
    cover: draft.coverUrl ? undefined : 'Загрузите обложку',
    questions: draft.questions.map((q) => ({
      questionText: q.questionText.trim() ? undefined : 'Введите текст вопроса',
      options: q.options.map((opt) => (opt.trim() ? undefined : 'Заполните вариант')),
    })),
  };
}

export function questionErrorCount(errors: DraftErrors, index: number): number {
  const questionErrors = errors.questions[index];
  if (!questionErrors) return 0;
  return (questionErrors.questionText ? 1 : 0) + questionErrors.options.filter(Boolean).length;
}
