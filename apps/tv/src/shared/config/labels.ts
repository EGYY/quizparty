import { Difficulty, GameMode, QuizCategory } from '@quizparty/shared';

export const categoryLabels: Record<QuizCategory, string> = {
  [QuizCategory.ALL]: 'Все',
  [QuizCategory.CINEMA]: 'Кино',
  [QuizCategory.MUSIC]: 'Музыка',
  [QuizCategory.HISTORY]: 'История',
  [QuizCategory.SCIENCE]: 'Наука',
  [QuizCategory.GAMES]: 'Игры',
  [QuizCategory.SPORTS]: 'Спорт',
  [QuizCategory.PARTY]: 'Вечеринка',
  [QuizCategory.KIDS]: 'Детям',
  [QuizCategory.ADULT]: '18+',
  [QuizCategory.ART]: 'Арт',
};

export const categoryIcons: Record<QuizCategory, string> = {
  [QuizCategory.ALL]: '⭐',
  [QuizCategory.CINEMA]: '🎬',
  [QuizCategory.MUSIC]: '🎵',
  [QuizCategory.HISTORY]: '🏛️',
  [QuizCategory.SCIENCE]: '🔬',
  [QuizCategory.GAMES]: '🎮',
  [QuizCategory.SPORTS]: '⚽',
  [QuizCategory.PARTY]: '🎉',
  [QuizCategory.KIDS]: '🐣',
  [QuizCategory.ADULT]: '🔞',
  [QuizCategory.ART]: '🎨',
};

export const difficultyLabels: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Легко',
  [Difficulty.MEDIUM]: 'Средне',
  [Difficulty.HARD]: 'Сложно',
};

export const modeLabels: Record<GameMode, string> = {
  [GameMode.FAST]: 'Быстрый',
  [GameMode.CLASSIC]: 'Классика',
};
