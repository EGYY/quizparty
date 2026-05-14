import { cinemaQuizzes } from './cinema.quizzes';
import { musicQuizzes } from './music.quizzes';
import { gamesQuizzes } from './games.quizzes';
import { partyQuizzes } from './party.quizzes';
import { kidsQuizzes } from './kids.quizzes';
import { scienceQuizzes } from './science.quizzes';
import { historyQuizzes } from './history.quizzes';
import { sportsQuizzes } from './sports.quizzes';
import { artQuizzes } from './art.quizzes';
import type { SeedQuiz } from './types';

export const allQuizzes: SeedQuiz[] = [
  ...cinemaQuizzes, // 8 quizzes
  ...musicQuizzes, // 4 quizzes
  ...gamesQuizzes, // 3 quizzes
  ...partyQuizzes, // 5 quizzes
  ...kidsQuizzes, // 2 quizzes
  ...scienceQuizzes, // 2 quizzes
  ...historyQuizzes, // 2 quizzes
  ...sportsQuizzes, // 1 quiz
  ...artQuizzes, // 1 quiz
  // Total: 28 quizzes × 12 questions = 336 questions
];

export type { SeedQuiz } from './types';
