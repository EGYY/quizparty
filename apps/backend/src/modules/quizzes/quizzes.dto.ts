import { createZodDto } from 'nestjs-zod';
import {
  adminDashboardSchema,
  adminQuizListSchema,
  approvedQuizListSchema,
  mediaSchema,
  mediaUploadResponseSchema,
  quizBrowserQuerySchema,
  quizDetailSchema,
  quizDraftSchema,
  reviewDecisionBodySchema,
  reviewQueueSchema,
  saveQuizDraftRequestSchema,
  saveQuizDraftResponseSchema,
} from '@quizparty/shared';

export class QuizDetailDto extends createZodDto(quizDetailSchema) {}
export class ApprovedQuizListDto extends createZodDto(approvedQuizListSchema) {}
export class QuizBrowserQueryDto extends createZodDto(quizBrowserQuerySchema) {}
export class QuizDraftDto extends createZodDto(quizDraftSchema) {}
export class SaveQuizDraftRequestDto extends createZodDto(saveQuizDraftRequestSchema) {}
export class SaveQuizDraftResponseDto extends createZodDto(saveQuizDraftResponseSchema) {}
export class MediaDto extends createZodDto(mediaSchema) {}
export class MediaUploadResponseDto extends createZodDto(mediaUploadResponseSchema) {}
export class AdminDashboardDto extends createZodDto(adminDashboardSchema) {}
export class AdminQuizListDto extends createZodDto(adminQuizListSchema) {}
export class ReviewQueueDto extends createZodDto(reviewQueueSchema) {}
export class ReviewDecisionBodyDto extends createZodDto(reviewDecisionBodySchema) {}
