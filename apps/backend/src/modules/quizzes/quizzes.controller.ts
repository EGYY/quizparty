import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  adminDashboardSchema,
  adminQuizListFiltersSchema,
  adminQuizListSchema,
  mediaSchema,
  quizBrowserQuerySchema,
  quizDraftSchema,
  reviewDecisionBodySchema,
  reviewQueueFiltersSchema,
} from '@quizparty/shared';
import type {
  AdminDashboard,
  AdminQuizList,
  Media,
  MediaUploadResponse,
  QuizDetail,
  QuizDraft,
  ReviewDecisionBody,
  ReviewQueue,
} from '@quizparty/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { QuizzesService } from './quizzes.service';

@Controller()
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get('quizzes/approved')
  async listApproved(@Query() query: unknown): Promise<QuizDetail[]> {
    const parsed = quizBrowserQuerySchema.parse(query);
    return this.quizzes.listApproved(parsed);
  }

  @Get('quizzes/approved/:quizId')
  async getApprovedDetail(@Param('quizId') quizId: string): Promise<QuizDetail> {
    return this.quizzes.getApprovedDetail(quizId);
  }

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() request: AuthenticatedRequest): Promise<AdminDashboard> {
    return adminDashboardSchema.parse(await this.quizzes.getDashboard(request.user));
  }

  @Get('admin/quizzes')
  @UseGuards(JwtAuthGuard)
  async listAdminQuizzes(@Query() query: unknown): Promise<AdminQuizList> {
    const parsed = adminQuizListFiltersSchema.parse(query);
    return adminQuizListSchema.parse(await this.quizzes.listAdminQuizzes(parsed));
  }

  @Post('admin/media')
  @UseGuards(JwtAuthGuard)
  async createMediaAsset(
    @Body(new ZodValidationPipe(mediaSchema)) body: Media,
  ): Promise<MediaUploadResponse> {
    return this.quizzes.createMediaAsset(body);
  }

  @Post('admin/media/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadMediaAsset(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    @Body('alt') alt: string | undefined,
    @Req() request: AuthenticatedRequest,
  ): Promise<MediaUploadResponse> {
    return this.quizzes.uploadMediaAsset(file, request.user.id, alt);
  }

  @Delete('admin/media')
  @UseGuards(JwtAuthGuard)
  async deleteMediaAsset(@Body('url') url: string): Promise<{ deleted: true }> {
    await this.quizzes.deleteUploadedMediaAsset(url);
    return { deleted: true };
  }

  @Get('admin/review')
  @UseGuards(JwtAuthGuard)
  async getReviewQueue(@Query() query: unknown): Promise<ReviewQueue> {
    const parsed = reviewQueueFiltersSchema.parse(query);
    return this.quizzes.getReviewQueue(parsed);
  }

  @Post('admin/review/:quizId/decision')
  @UseGuards(JwtAuthGuard)
  async reviewQuiz(
    @Param('quizId') quizId: string,
    @Body(new ZodValidationPipe(reviewDecisionBodySchema)) body: ReviewDecisionBody,
    @Req() request: AuthenticatedRequest,
  ): Promise<QuizDraft> {
    return this.quizzes.reviewQuiz({ ...body, quizId }, request.user.id);
  }

  @Get('quizzes/:quizId/draft')
  @UseGuards(JwtAuthGuard)
  async getDraft(@Param('quizId') quizId: string): Promise<QuizDraft> {
    return this.quizzes.getDraft(quizId);
  }

  @Put('quizzes/draft')
  @UseGuards(JwtAuthGuard)
  async saveDraft(
    @Body(new ZodValidationPipe(quizDraftSchema)) body: QuizDraft,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quizzes.saveDraft(body, request.user.id);
  }

  @Delete('quizzes/:quizId')
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(@Param('quizId') quizId: string): Promise<{ deleted: true }> {
    await this.quizzes.deleteQuiz(quizId);
    return { deleted: true };
  }

  @Post('quizzes/:quizId/submit-review')
  @UseGuards(JwtAuthGuard)
  async submitForReview(@Param('quizId') quizId: string): Promise<QuizDraft> {
    return this.quizzes.submitForReview(quizId);
  }
}
