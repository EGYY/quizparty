import {
  AdminSort,
  Difficulty,
  QuizCategory,
  QuizStatus,
  ReviewRejectionReason,
} from '@quizparty/shared';

export const categoryOptions = Object.values(QuizCategory).filter(
  (category): category is Exclude<QuizCategory, QuizCategory.ALL> => category !== QuizCategory.ALL,
);

export const difficultyOptions = Object.values(Difficulty);
export const statusOptions = Object.values(QuizStatus);
export const sortOptions = Object.values(AdminSort);
export const rejectionReasonOptions = Object.values(ReviewRejectionReason);

export const labels: Record<string, string> = {
  [QuizCategory.ALL]: 'Все категории',
  [QuizCategory.CINEMA]: 'Кино',
  [QuizCategory.MUSIC]: 'Музыка',
  [QuizCategory.HISTORY]: 'История',
  [QuizCategory.SCIENCE]: 'Наука',
  [QuizCategory.GAMES]: 'Игры',
  [QuizCategory.SPORTS]: 'Спорт',
  [QuizCategory.PARTY]: 'Для компании',
  [QuizCategory.KIDS]: 'Детям',
  [QuizCategory.ADULT]: '18+',
  [QuizCategory.ART]: 'Арт',
  [Difficulty.EASY]: 'Легко',
  [Difficulty.MEDIUM]: 'Средне',
  [Difficulty.HARD]: 'Сложно',
  [QuizStatus.DRAFT]: 'Черновик',
  [QuizStatus.PENDING_REVIEW]: 'На ревью',
  [QuizStatus.APPROVED]: 'Одобрен',
  [QuizStatus.REJECTED]: 'Отклонен',
  [AdminSort.NEWEST]: 'Сначала новые',
  [AdminSort.OLDEST]: 'Сначала старые',
  [AdminSort.TITLE]: 'По названию',
  [ReviewRejectionReason.LOW_COVER_QUALITY]: 'Обложка',
  [ReviewRejectionReason.GRAMMAR_ERRORS]: 'Грамматика',
  [ReviewRejectionReason.FACTUAL_ERRORS]: 'Факты',
  [ReviewRejectionReason.DUPLICATE_OR_SIMILAR_QUESTIONS]: 'Повторы',
  [ReviewRejectionReason.RULE_VIOLATION]: 'Правила',
  [ReviewRejectionReason.INSUFFICIENT_QUESTIONS]: 'Мало вопросов',
  [ReviewRejectionReason.INVALID_MEDIA]: 'Медиа',
};
