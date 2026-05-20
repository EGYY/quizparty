import {
  Difficulty as PrismaDifficulty,
  MediaType as PrismaMediaType,
  QuizCategory as PrismaQuizCategory,
  QuizStatus as PrismaQuizStatus,
  Role as PrismaRole,
} from '@prisma/client';
import { Difficulty, MediaType, QuizCategory, QuizStatus, Role } from '@quizparty/shared';

// Идентичные по значениям enum'ы shared и Prisma; маппер делает явный
// типобезопасный переход вместо `as any`. `as const satisfies Record<...>`
// гарантирует исчерпываемость: новый член shared без записи здесь — compile-error.

// QuizCategory.ALL — UI-сентинел для фильтра, в БД его нет. Для записей
// используем только реальные категории.
export type WritableQuizCategory = Exclude<QuizCategory, QuizCategory.ALL>;

export const toPrismaRole = {
  [Role.ADMIN]: PrismaRole.ADMIN,
  [Role.AUTHOR]: PrismaRole.AUTHOR,
} as const satisfies Record<Role, PrismaRole>;

export const toPrismaQuizStatus = {
  [QuizStatus.DRAFT]: PrismaQuizStatus.DRAFT,
  [QuizStatus.PENDING_REVIEW]: PrismaQuizStatus.PENDING_REVIEW,
  [QuizStatus.APPROVED]: PrismaQuizStatus.APPROVED,
  [QuizStatus.REJECTED]: PrismaQuizStatus.REJECTED,
} as const satisfies Record<QuizStatus, PrismaQuizStatus>;

export const toPrismaQuizCategory = {
  [QuizCategory.CINEMA]: PrismaQuizCategory.CINEMA,
  [QuizCategory.MUSIC]: PrismaQuizCategory.MUSIC,
  [QuizCategory.HISTORY]: PrismaQuizCategory.HISTORY,
  [QuizCategory.SCIENCE]: PrismaQuizCategory.SCIENCE,
  [QuizCategory.GAMES]: PrismaQuizCategory.GAMES,
  [QuizCategory.SPORTS]: PrismaQuizCategory.SPORTS,
  [QuizCategory.PARTY]: PrismaQuizCategory.PARTY,
  [QuizCategory.KIDS]: PrismaQuizCategory.KIDS,
  [QuizCategory.ADULT]: PrismaQuizCategory.ADULT,
  [QuizCategory.ART]: PrismaQuizCategory.ART,
} as const satisfies Record<WritableQuizCategory, PrismaQuizCategory>;

export const toPrismaDifficulty = {
  [Difficulty.EASY]: PrismaDifficulty.EASY,
  [Difficulty.MEDIUM]: PrismaDifficulty.MEDIUM,
  [Difficulty.HARD]: PrismaDifficulty.HARD,
} as const satisfies Record<Difficulty, PrismaDifficulty>;

export const toPrismaMediaType = {
  [MediaType.IMAGE]: PrismaMediaType.IMAGE,
  [MediaType.AUDIO]: PrismaMediaType.AUDIO,
  [MediaType.VIDEO]: PrismaMediaType.VIDEO,
} as const satisfies Record<MediaType, PrismaMediaType>;
