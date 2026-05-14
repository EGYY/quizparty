import { Difficulty, QuizCategory, QuizStatus } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';

export type TvQuiz = QuizDetail;

export const fallbackQuizzes: TvQuiz[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Киномания',
    description: 'Культовые фильмы, актеры и режиссеры для шумной компании.',
    fullDescription:
      'Проверьте, насколько хорошо гости помнят сцены, цитаты и неожиданные факты из кино.',
    category: QuizCategory.CINEMA,
    difficulty: Difficulty.MEDIUM,
    status: QuizStatus.APPROVED,
    coverUrl: 'http://localhost:5173/assets/covers/cinema.svg',
    themeColor: '#ffb38a',
    authorName: 'QuizMaster',
    questionCount: 10,
    estimatedMinutes: 12,
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    tags: ['кино', 'вечеринка'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: 'Музыкальный Батл',
    description: 'Угадай исполнителей, хиты и эпохи быстрее друзей.',
    fullDescription:
      'Музыкальная подборка с вопросами для игроков, которые уверены, что знают все припевы.',
    category: QuizCategory.MUSIC,
    difficulty: Difficulty.HARD,
    status: QuizStatus.APPROVED,
    coverUrl: 'http://localhost:5173/assets/covers/music.svg',
    themeColor: '#ff7ac8',
    authorName: 'QuizMaster',
    questionCount: 12,
    estimatedMinutes: 15,
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    tags: ['музыка', 'хиты'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    title: 'Наука вокруг нас',
    description: 'Яркие факты о технологиях, космосе и мире рядом.',
    fullDescription:
      'Легкий научный квиз для разогрева и удивленных обсуждений после каждого ответа.',
    category: QuizCategory.SCIENCE,
    difficulty: Difficulty.EASY,
    status: QuizStatus.APPROVED,
    coverUrl: 'http://localhost:5173/assets/covers/science.svg',
    themeColor: '#5ed7ff',
    authorName: 'QuizMaster',
    questionCount: 8,
    estimatedMinutes: 10,
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    tags: ['наука', 'технологии'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const tvCategories = [
  QuizCategory.ALL,
  QuizCategory.CINEMA,
  QuizCategory.MUSIC,
  QuizCategory.HISTORY,
  QuizCategory.SCIENCE,
  QuizCategory.GAMES,
  QuizCategory.PARTY,
];
