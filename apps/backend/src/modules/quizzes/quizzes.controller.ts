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
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  adminDashboardSchema,
  adminQuizListFiltersSchema,
  adminQuizListSchema,
  approvedQuizListSchema,
  mediaSchema,
  quizBrowserQuerySchema,
  quizDraftSchema,
  reviewDecisionBodySchema,
  reviewQueueFiltersSchema,
} from '@quizparty/shared';
import type {
  AdminDashboard,
  AdminQuizList,
  ApprovedQuizList,
  Media,
  MediaUploadResponse,
  QuizDetail,
  QuizDraft,
  ReviewDecisionBody,
  ReviewQueue,
} from '@quizparty/shared';
import { Difficulty, QuizCategory, Role } from '@quizparty/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { QuizzesService } from './quizzes.service';
import {
  AdminDashboardDto,
  AdminQuizListDto,
  ApprovedQuizListDto,
  MediaDto,
  MediaUploadResponseDto,
  QuizDetailDto,
  QuizDraftDto,
  ReviewDecisionBodyDto,
  ReviewQueueDto,
  SaveQuizDraftResponseDto,
} from './quizzes.dto';

@ApiTags('quizzes', 'admin')
@Controller()
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @ApiTags('quizzes')
  @ApiOperation({ summary: 'List approved quizzes' })
  @ApiQuery({ name: 'category', enum: QuizCategory, required: false })
  @ApiQuery({ name: 'difficulty', enum: Difficulty, required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, type: ApprovedQuizListDto })
  @Get('quizzes/approved')
  async listApproved(@Query() query: unknown): Promise<ApprovedQuizList> {
    const parsed = quizBrowserQuerySchema.parse(query);
    return approvedQuizListSchema.parse(await this.quizzes.listApproved(parsed));
  }

  @ApiTags('quizzes')
  @ApiOperation({ summary: 'Get approved quiz detail' })
  @ApiParam({ name: 'quizId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: QuizDetailDto })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Get('quizzes/approved/:quizId')
  async getApprovedDetail(@Param('quizId') quizId: string): Promise<QuizDetail> {
    return this.quizzes.getApprovedDetail(quizId);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Author dashboard stats + recent quizzes' })
  @ApiResponse({ status: 200, type: AdminDashboardDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() request: AuthenticatedRequest): Promise<AdminDashboard> {
    return adminDashboardSchema.parse(await this.quizzes.getDashboard(request.user));
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'List author quizzes with filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', enum: QuizCategory, required: false })
  @ApiQuery({ name: 'difficulty', enum: Difficulty, required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: AdminQuizListDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('admin/quizzes')
  @UseGuards(JwtAuthGuard)
  async listAdminQuizzes(
    @Query() query: unknown,
    @Req() request: AuthenticatedRequest,
  ): Promise<AdminQuizList> {
    const parsed = adminQuizListFiltersSchema.parse(query);
    return adminQuizListSchema.parse(await this.quizzes.listAdminQuizzes(parsed, request.user));
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Create media asset metadata record' })
  @ApiBody({ type: MediaDto })
  @ApiResponse({ status: 201, type: MediaUploadResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('admin/media')
  @UseGuards(JwtAuthGuard)
  async createMediaAsset(
    @Body(new ZodValidationPipe(mediaSchema)) body: Media,
    @Req() request: AuthenticatedRequest,
  ): Promise<MediaUploadResponse> {
    return this.quizzes.createMediaAsset(body, request.user.id);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Upload media file (max 50 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string', description: 'Alt text for the media' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: MediaUploadResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('admin/media/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadMediaAsset(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    @Body('alt') alt: string | undefined,
    @Req() request: AuthenticatedRequest,
  ): Promise<MediaUploadResponse> {
    return this.quizzes.uploadMediaAsset(file, request.user.id, alt);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Delete media asset by URL' })
  @ApiBody({
    schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
  })
  @ApiResponse({ status: 200, schema: { example: { deleted: true } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('admin/media')
  @UseGuards(JwtAuthGuard)
  async deleteMediaAsset(
    @Body('url') url: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ deleted: true }> {
    await this.quizzes.deleteUploadedMediaAsset(url, request.user);
    return { deleted: true };
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Review queue (Admin role required)' })
  @ApiResponse({ status: 200, type: ReviewQueueDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  @Get('admin/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getReviewQueue(@Query() query: unknown): Promise<ReviewQueue> {
    const parsed = reviewQueueFiltersSchema.parse(query);
    return this.quizzes.getReviewQueue(parsed);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Submit review decision (Admin role required)' })
  @ApiParam({ name: 'quizId', type: String, format: 'uuid' })
  @ApiBody({ type: ReviewDecisionBodyDto })
  @ApiResponse({ status: 200, type: QuizDraftDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  @Post('admin/review/:quizId/decision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewQuiz(
    @Param('quizId') quizId: string,
    @Body(new ZodValidationPipe(reviewDecisionBodySchema)) body: ReviewDecisionBody,
    @Req() request: AuthenticatedRequest,
  ): Promise<QuizDraft> {
    return this.quizzes.reviewQuiz({ ...body, quizId }, request.user.id);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Get quiz draft by ID' })
  @ApiParam({ name: 'quizId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: QuizDraftDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found or not owned by user' })
  @Get('quizzes/:quizId/draft')
  @UseGuards(JwtAuthGuard)
  async getDraft(
    @Param('quizId') quizId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<QuizDraft> {
    return this.quizzes.getDraft(quizId, request.user);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Save quiz draft' })
  @ApiBody({ type: QuizDraftDto })
  @ApiResponse({ status: 200, type: SaveQuizDraftResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('quizzes/draft')
  @UseGuards(JwtAuthGuard)
  async saveDraft(
    @Body(new ZodValidationPipe(quizDraftSchema)) body: QuizDraft,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quizzes.saveDraft(body, request.user);
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiParam({ name: 'quizId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, schema: { example: { deleted: true } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found or not owned by user' })
  @Delete('quizzes/:quizId')
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(
    @Param('quizId') quizId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ deleted: true }> {
    await this.quizzes.deleteQuiz(quizId, request.user);
    return { deleted: true };
  }

  @ApiBearerAuth('access-token')
  @ApiTags('admin')
  @ApiOperation({ summary: 'Submit quiz for review' })
  @ApiParam({ name: 'quizId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: QuizDraftDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 422, description: 'Quiz fails validation checks' })
  @Post('quizzes/:quizId/submit-review')
  @UseGuards(JwtAuthGuard)
  async submitForReview(
    @Param('quizId') quizId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<QuizDraft> {
    return this.quizzes.submitForReview(quizId, request.user);
  }
}
