import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminQuizList,
  AdminQuizListFilters,
  AdminSort,
  AdminDashboard,
  MediaType,
  Media,
  MediaUploadResponse,
  QualityWarningCode,
  QuizBrowserQuery,
  QuizCategory,
  QuizDetail,
  QuizDraft,
  QuizStatus,
  ReviewDecisionPayload,
  ReviewQueue,
  ReviewQueueFilters,
  Role,
  SaveQuizDraftResponse,
  UserSummary,
} from '@quizparty/shared';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join, normalize, resolve } from 'node:path';
import { PrismaService } from '../../database/prisma.service';
import { mapQuizCard, mapQuizDetail, mapQuizDraft, validateQuizDraft } from './quiz.mapper';

type UploadedMediaFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024;
const UPLOAD_PUBLIC_PATH = '/uploads/quiz-media';
const supportedMimeTypes: Record<string, { extension: string; type: MediaType }> = {
  'image/gif': { extension: 'gif', type: MediaType.IMAGE },
  'image/jpeg': { extension: 'jpg', type: MediaType.IMAGE },
  'image/png': { extension: 'png', type: MediaType.IMAGE },
  'image/webp': { extension: 'webp', type: MediaType.IMAGE },
  'audio/mpeg': { extension: 'mp3', type: MediaType.AUDIO },
  'audio/ogg': { extension: 'ogg', type: MediaType.AUDIO },
  'video/mp4': { extension: 'mp4', type: MediaType.VIDEO },
  'video/webm': { extension: 'webm', type: MediaType.VIDEO },
};

@Injectable()
export class QuizzesService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async listApproved(query: QuizBrowserQuery): Promise<QuizDetail[]> {
    const where = {
      status: QuizStatus.APPROVED as any,
      ...(query.category !== QuizCategory.ALL ? { category: query.category as any } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty as any } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.tags.length ? { tags: { hasEvery: query.tags } } : {}),
    };

    const quizzes = await this.prisma.quiz.findMany({
      where,
      include: {
        author: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ playCount: 'desc' }, { updatedAt: 'desc' }],
    });

    return quizzes.map(mapQuizDetail);
  }

  async getApprovedDetail(quizId: string): Promise<QuizDetail> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, status: QuizStatus.APPROVED as any },
      include: {
        author: true,
        _count: { select: { questions: true } },
      },
    });

    if (!quiz) throw new NotFoundException('Approved quiz not found');
    return mapQuizDetail(quiz);
  }

  async getApprovedQuizForRoom(quizId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, status: QuizStatus.APPROVED as any },
      include: {
        author: true,
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { questions: true } },
      },
    });

    if (!quiz) throw new NotFoundException('Approved quiz not found');
    return quiz;
  }

  async getDashboard(currentUser: UserSummary): Promise<AdminDashboard> {
    const [totalQuizzes, pendingReview, drafts, approved, rejected, recentQuizzes] =
      await Promise.all([
        this.prisma.quiz.count(),
        this.prisma.quiz.count({ where: { status: QuizStatus.PENDING_REVIEW as any } }),
        this.prisma.quiz.count({ where: { status: QuizStatus.DRAFT as any } }),
        this.prisma.quiz.count({ where: { status: QuizStatus.APPROVED as any } }),
        this.prisma.quiz.count({ where: { status: QuizStatus.REJECTED as any } }),
        this.prisma.quiz.findMany({
          take: 8,
          include: { author: true, _count: { select: { questions: true } } },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

    return {
      stats: { totalQuizzes, pendingReview, drafts, approved, rejected },
      recentQuizzes: recentQuizzes.map(mapQuizCard),
      qualityWarnings: [
        {
          code: QualityWarningCode.MISSING_COVER,
          label: 'Нет обложки',
          description: 'Квизы без обложки хуже смотрятся на TV.',
          count: await this.prisma.quiz.count({ where: { coverUrl: null } }),
        },
        {
          code: QualityWarningCode.TOO_FEW_QUESTIONS,
          label: 'Мало вопросов',
          description: 'Для публикации нужно минимум 5 вопросов.',
          count: await this.prisma.quiz.count({ where: { questions: { none: {} } } }),
        },
      ],
      currentUser,
    };
  }

  async listAdminQuizzes(filters: AdminQuizListFilters): Promise<AdminQuizList> {
    const where = {
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.category && filters.category !== QuizCategory.ALL
        ? { category: filters.category as any }
        : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty as any } : {}),
      ...(filters.tags.length ? { tags: { hasEvery: filters.tags } } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' as const } },
              { description: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const orderBy =
      filters.sort === AdminSort.OLDEST
        ? { updatedAt: 'asc' as const }
        : filters.sort === AdminSort.TITLE
          ? { title: 'asc' as const }
          : { updatedAt: 'desc' as const };

    const [items, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        take: 60,
        include: { author: true, _count: { select: { questions: true } } },
        orderBy,
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      items: items.map(mapQuizCard),
      filters,
      total,
    };
  }

  async createMediaAsset(media: Media): Promise<MediaUploadResponse> {
    const saved = await this.prisma.mediaAsset.create({
      data: {
        url: media.url,
        type: media.type as any,
        alt: media.alt ?? null,
        sizeBytes: media.sizeBytes ?? null,
      },
    });

    return {
      media: {
        url: saved.url,
        type: saved.type as any,
        ...(saved.alt ? { alt: saved.alt } : {}),
        ...(saved.sizeBytes ? { sizeBytes: saved.sizeBytes } : {}),
      },
      id: saved.id,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async uploadMediaAsset(
    file: UploadedMediaFile | undefined,
    ownerId: string,
    alt?: string,
  ): Promise<MediaUploadResponse> {
    if (!file?.buffer) throw new BadRequestException('Media file is required');
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      throw new BadRequestException('Media file must be 10MB or smaller');
    }

    const metadata = supportedMimeTypes[file.mimetype];
    if (!metadata) {
      throw new BadRequestException('Unsupported media type');
    }

    const uploadDir = this.getQuizMediaUploadDir();
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}.${metadata.extension}`;
    const absolutePath = join(uploadDir, filename);
    await writeFile(absolutePath, file.buffer);

    const media: Media = {
      url: `${UPLOAD_PUBLIC_PATH}/${encodeURIComponent(filename)}`,
      type: metadata.type,
      ...(alt?.trim() ? { alt: alt.trim().slice(0, 160) } : {}),
      sizeBytes: file.size,
    };

    const saved = await this.prisma.mediaAsset
      .create({
        data: {
          url: media.url,
          type: media.type as any,
          alt: media.alt ?? null,
          sizeBytes: media.sizeBytes ?? null,
          ownerId,
        },
      })
      .catch(async (error: unknown) => {
        await unlink(absolutePath).catch(() => undefined);
        throw error;
      });

    return {
      media,
      id: saved.id,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async getDraft(quizId: string): Promise<QuizDraft> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, author: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    return mapQuizDraft(quiz);
  }

  async saveDraft(draft: QuizDraft, authorId: string): Promise<SaveQuizDraftResponse> {
    const previousQuiz = draft.id
      ? await this.prisma.quiz.findUnique({
          where: { id: draft.id },
          include: { questions: true },
        })
      : null;
    const previousMediaUrls = previousQuiz
      ? this.collectQuizMediaUrls(previousQuiz)
      : new Set<string>();

    const saved = draft.id
      ? await this.prisma.quiz.update({
          where: { id: draft.id },
          data: {
            title: draft.title,
            description: draft.description ?? null,
            category: draft.category as any,
            difficulty: draft.difficulty as any,
            status: draft.status as any,
            coverUrl: draft.coverUrl ?? null,
            themeColor: draft.themeColor ?? null,
            recommendedPlayersMin: draft.recommendedPlayersMin ?? null,
            recommendedPlayersMax: draft.recommendedPlayersMax ?? null,
            estimatedMinutes: draft.estimatedMinutes ?? null,
            tags: draft.tags,
          },
          include: { questions: true, author: true },
        })
      : await this.prisma.quiz.create({
          data: {
            title: draft.title,
            description: draft.description ?? null,
            category: draft.category as any,
            difficulty: draft.difficulty as any,
            status: QuizStatus.DRAFT as any,
            coverUrl: draft.coverUrl ?? null,
            themeColor: draft.themeColor ?? null,
            recommendedPlayersMin: draft.recommendedPlayersMin ?? null,
            recommendedPlayersMax: draft.recommendedPlayersMax ?? null,
            estimatedMinutes: draft.estimatedMinutes ?? null,
            tags: draft.tags,
            authorId,
          },
          include: { questions: true, author: true },
        });

    const existingQuestionIds = draft.questions
      .map((question) => question.id)
      .filter((questionId): questionId is string => Boolean(questionId));

    await this.prisma.question.deleteMany({
      where: {
        quizId: saved.id,
        ...(existingQuestionIds.length ? { id: { notIn: existingQuestionIds } } : {}),
      },
    });

    for (const question of draft.questions) {
      const questionData = {
        quizId: saved.id,
        questionText: question.questionText,
        mediaUrl: question.media?.url ?? null,
        mediaType: (question.media?.type as any) ?? null,
        mediaAlt: question.media?.alt ?? null,
        mediaStartMs: question.media?.startMs ?? null,
        mediaEndMs: question.media?.endMs ?? null,
        mediaPosterUrl: question.media?.posterUrl ?? null,
        mediaPrompt: question.media?.prompt ?? null,
        revealMediaUrl: question.revealMedia?.url ?? null,
        revealMediaType: (question.revealMedia?.type as any) ?? null,
        revealMediaAlt: question.revealMedia?.alt ?? null,
        revealMediaStartMs: question.revealMedia?.startMs ?? null,
        revealMediaEndMs: question.revealMedia?.endMs ?? null,
        revealMediaPosterUrl: question.revealMedia?.posterUrl ?? null,
        revealMediaPrompt: question.revealMedia?.prompt ?? null,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation ?? null,
        order: question.order,
      } as any;

      if (question.id) {
        await this.prisma.question.update({
          where: { id: question.id },
          data: questionData,
        });
      } else {
        await this.prisma.question.create({
          data: questionData,
        });
      }
    }

    const savedWithQuestions = await this.prisma.quiz.findUniqueOrThrow({
      where: { id: saved.id },
      include: { questions: true, author: true },
    });
    await this.cleanupReplacedMedia(
      previousMediaUrls,
      this.collectQuizMediaUrls(savedWithQuestions),
      saved.id,
    );

    return {
      quiz: mapQuizDraft(savedWithQuestions),
      validation: validateQuizDraft(savedWithQuestions),
      savedAt: new Date().toISOString(),
    };
  }

  async submitForReview(quizId: string): Promise<QuizDraft> {
    const quiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: { status: QuizStatus.PENDING_REVIEW as any, submittedAt: new Date() },
      include: { questions: true, author: true },
    });

    return mapQuizDraft(quiz);
  }

  async getReviewQueue(filters: ReviewQueueFilters): Promise<ReviewQueue> {
    const where = {
      status: (filters.status ?? QuizStatus.PENDING_REVIEW) as any,
      ...(filters.category && filters.category !== QuizCategory.ALL
        ? { category: filters.category as any }
        : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty as any } : {}),
      ...(filters.authorId ? { authorId: filters.authorId } : {}),
      ...(filters.tags.length ? { tags: { hasEvery: filters.tags } } : {}),
      ...(filters.search
        ? { title: { contains: filters.search, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        take: 20,
        include: {
          author: true,
          questions: true,
          _count: { select: { questions: true } },
        },
        orderBy: filters.sort === 'OLDEST' ? { submittedAt: 'asc' } : { submittedAt: 'desc' },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    const queueItems = items.map((quiz: any) => ({
      ...mapQuizCard(quiz),
      submittedAt: (quiz.submittedAt ?? quiz.updatedAt).toISOString(),
      author: {
        id: quiz.author.id,
        email: quiz.author.email,
        displayName: quiz.author.displayName,
        role: quiz.author.role as Role,
        ...(quiz.author.avatarUrl ? { avatarUrl: quiz.author.avatarUrl } : {}),
      },
      validation: validateQuizDraft(quiz),
    }));

    return {
      items: queueItems,
      ...(queueItems[0] ? { selectedQuiz: queueItems[0] } : {}),
      filters,
      total,
    };
  }

  async reviewQuiz(payload: ReviewDecisionPayload, reviewerId: string): Promise<QuizDraft> {
    const nextStatus = payload.approve ? QuizStatus.APPROVED : QuizStatus.REJECTED;
    const quiz = await this.prisma.quiz.update({
      where: { id: payload.quizId },
      data: {
        status: nextStatus as any,
        approvedAt: payload.approve ? new Date() : null,
        rejectionReason: payload.approve ? null : (payload.comment ?? payload.reasons.join(', ')),
      },
      include: { questions: true, author: true },
    });

    await this.prisma.quizReview.create({
      data: {
        quizId: payload.quizId,
        reviewerId,
        fromStatus: QuizStatus.PENDING_REVIEW as any,
        toStatus: nextStatus as any,
        reasons: payload.reasons,
        comment: payload.comment ?? null,
      },
    });

    return mapQuizDraft(quiz);
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    const mediaUrls = this.collectQuizMediaUrls(quiz);
    await this.prisma.quiz.delete({ where: { id: quizId } });
    await this.cleanupUnusedLocalMedia(mediaUrls);
  }

  async deleteUploadedMediaAsset(url: string): Promise<void> {
    if (!url) throw new BadRequestException('Media url is required');
    await this.cleanupUnusedLocalMedia([url]);
  }

  private getUploadRoot(): string {
    const configured = this.config.get<string>('UPLOAD_ROOT_DIR', 'uploads');
    return isAbsolute(configured) ? configured : resolve(process.cwd(), configured);
  }

  private getQuizMediaUploadDir(): string {
    return join(this.getUploadRoot(), 'quiz-media');
  }

  private collectQuizMediaUrls(quiz: {
    coverUrl?: string | null;
    questions?: Array<{
      mediaUrl?: string | null;
      revealMediaUrl?: string | null;
    }>;
  }): Set<string> {
    return new Set(
      [
        quiz.coverUrl,
        ...(quiz.questions ?? []).flatMap((question) => [
          question.mediaUrl,
          'revealMediaUrl' in question ? question.revealMediaUrl : undefined,
        ]),
      ].filter((url): url is string => Boolean(url)),
    );
  }

  private async cleanupReplacedMedia(
    previousMediaUrls: Set<string>,
    nextMediaUrls: Set<string>,
    quizId: string,
  ): Promise<void> {
    const removedUrls = [...previousMediaUrls].filter((url) => !nextMediaUrls.has(url));
    await this.cleanupUnusedLocalMedia(removedUrls, quizId);
  }

  private async cleanupUnusedLocalMedia(
    urls: Iterable<string>,
    currentQuizId?: string,
  ): Promise<void> {
    for (const url of urls) {
      if (!this.isLocalUploadUrl(url)) continue;
      const [quizRefs, questionRefs] = await Promise.all([
        this.prisma.quiz.count({
          where: {
            coverUrl: url,
            ...(currentQuizId ? { id: { not: currentQuizId } } : {}),
          },
        }),
        this.prisma.question.count({
          where: {
            mediaUrl: url,
            ...(currentQuizId ? { quizId: { not: currentQuizId } } : {}),
          },
        }),
      ]);

      if (quizRefs + questionRefs > 0) continue;
      await this.deleteLocalUploadFile(url);
      await this.prisma.mediaAsset.deleteMany({ where: { url } });
    }
  }

  private isLocalUploadUrl(url: string): boolean {
    // URLs are stored as relative paths: /uploads/quiz-media/filename
    // Support legacy absolute URLs (https://domain/uploads/...) for backward compat
    const pathname = this.getUploadPathname(url);
    return pathname.startsWith(`${UPLOAD_PUBLIC_PATH}/`);
  }

  private async deleteLocalUploadFile(url: string): Promise<void> {
    const pathname = this.getUploadPathname(url);
    const filename = basename(decodeURIComponent(pathname));
    const uploadDir = normalize(this.getQuizMediaUploadDir());
    const filePath = normalize(join(uploadDir, filename));
    if (!filePath.startsWith(uploadDir)) return;

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  private getUploadPathname(url: string): string {
    // Relative path → return as-is; absolute URL → extract pathname
    if (url.startsWith('/')) return url;
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
}
