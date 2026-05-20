import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
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
import { basename, join, normalize } from 'node:path';
import { resolveUploadRoot } from '../../config/upload';
import {
  toPrismaDifficulty,
  toPrismaMediaType,
  toPrismaQuizCategory,
  toPrismaQuizStatus,
  type WritableQuizCategory,
} from '../../database/prisma-enums';
import { PrismaService } from '../../database/prisma.service';
import { fileMatchesMime } from './media-signature';
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

  /** ADMIN видит/правит любой квиз; AUTHOR — только свой. */
  private assertCanManageQuiz(quiz: { authorId: string }, actor: UserSummary): void {
    if (actor.role !== Role.ADMIN && quiz.authorId !== actor.id) {
      throw new ForbiddenException('You do not have access to this quiz');
    }
  }

  async listApproved(query: QuizBrowserQuery): Promise<QuizDetail[]> {
    const where = {
      status: toPrismaQuizStatus[QuizStatus.APPROVED],
      ...(query.category !== QuizCategory.ALL
        ? { category: toPrismaQuizCategory[query.category] }
        : {}),
      ...(query.difficulty ? { difficulty: toPrismaDifficulty[query.difficulty] } : {}),
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
      // Жёсткий потолок: каталог одобренных квизов больше не выгружается
      // целиком (раньше findMany был без лимита — риск памяти/латентности).
      take: 100,
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
      where: { id: quizId, status: toPrismaQuizStatus[QuizStatus.APPROVED] },
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
      where: { id: quizId, status: toPrismaQuizStatus[QuizStatus.APPROVED] },
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
    // ADMIN видит метрики по всем квизам; AUTHOR — только по своим.
    const scope = currentUser.role === Role.ADMIN ? {} : { authorId: currentUser.id };

    const [
      totalQuizzes,
      pendingReview,
      drafts,
      approved,
      rejected,
      recentQuizzes,
      missingCover,
      tooFewQuestions,
    ] = await Promise.all([
      this.prisma.quiz.count({ where: scope }),
      this.prisma.quiz.count({ where: { ...scope, status: toPrismaQuizStatus[QuizStatus.PENDING_REVIEW] } }),
      this.prisma.quiz.count({ where: { ...scope, status: toPrismaQuizStatus[QuizStatus.DRAFT] } }),
      this.prisma.quiz.count({ where: { ...scope, status: toPrismaQuizStatus[QuizStatus.APPROVED] } }),
      this.prisma.quiz.count({ where: { ...scope, status: toPrismaQuizStatus[QuizStatus.REJECTED] } }),
      this.prisma.quiz.findMany({
        where: scope,
        take: 8,
        include: { author: true, _count: { select: { questions: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.quiz.count({ where: { ...scope, coverUrl: null } }),
      this.prisma.quiz.count({ where: { ...scope, questions: { none: {} } } }),
    ]);

    return {
      stats: { totalQuizzes, pendingReview, drafts, approved, rejected },
      recentQuizzes: recentQuizzes.map(mapQuizCard),
      qualityWarnings: [
        {
          code: QualityWarningCode.MISSING_COVER,
          label: 'Нет обложки',
          description: 'Квизы без обложки хуже смотрятся на TV.',
          count: missingCover,
        },
        {
          code: QualityWarningCode.TOO_FEW_QUESTIONS,
          label: 'Мало вопросов',
          description: 'Для публикации нужно минимум 5 вопросов.',
          count: tooFewQuestions,
        },
      ],
      currentUser,
    };
  }

  async listAdminQuizzes(
    filters: AdminQuizListFilters,
    actor: UserSummary,
  ): Promise<AdminQuizList> {
    const where = {
      ...(actor.role !== Role.ADMIN ? { authorId: actor.id } : {}),
      ...(filters.status ? { status: toPrismaQuizStatus[filters.status] } : {}),
      ...(filters.category && filters.category !== QuizCategory.ALL
        ? { category: toPrismaQuizCategory[filters.category] }
        : {}),
      ...(filters.difficulty ? { difficulty: toPrismaDifficulty[filters.difficulty] } : {}),
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

  async createMediaAsset(media: Media, ownerId: string): Promise<MediaUploadResponse> {
    const saved = await this.prisma.mediaAsset.create({
      data: {
        url: media.url,
        type: toPrismaMediaType[media.type],
        alt: media.alt ?? null,
        sizeBytes: media.sizeBytes ?? null,
        ownerId,
      },
    });

    return {
      media: {
        url: saved.url,
        type: saved.type as MediaType,
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
    if (!fileMatchesMime(file.mimetype, file.buffer)) {
      throw new BadRequestException('Media content does not match its declared type');
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
          type: toPrismaMediaType[media.type],
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

  async getDraft(quizId: string, actor: UserSummary): Promise<QuizDraft> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, author: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    this.assertCanManageQuiz(quiz, actor);
    return mapQuizDraft(quiz);
  }

  async saveDraft(draft: QuizDraft, actor: UserSummary): Promise<SaveQuizDraftResponse> {
    const previousQuiz = draft.id
      ? await this.prisma.quiz.findUnique({
          where: { id: draft.id },
          include: { questions: true },
        })
      : null;

    if (draft.id) {
      if (!previousQuiz) throw new NotFoundException('Quiz not found');
      this.assertCanManageQuiz(previousQuiz, actor);
    }

    const previousMediaUrls = previousQuiz
      ? this.collectQuizMediaUrls(previousQuiz)
      : new Set<string>();

    // Все записи (квиз + вопросы) — в одной транзакции: при сбое посередине
    // черновик не остаётся в полусохранённом состоянии.
    const savedWithQuestions = await this.prisma.$transaction(async (tx) => {
      const saved = draft.id
        ? await tx.quiz.update({
            where: { id: draft.id },
            data: {
              // status намеренно НЕ берётся из тела запроса: смена статуса —
              // только через submitForReview / reviewQuiz (анти-самопубликация).
              title: draft.title,
              description: draft.description ?? null,
              category: toPrismaQuizCategory[draft.category as WritableQuizCategory],
              difficulty: toPrismaDifficulty[draft.difficulty],
              coverUrl: draft.coverUrl ?? null,
              themeColor: draft.themeColor ?? null,
              recommendedPlayersMin: draft.recommendedPlayersMin ?? null,
              recommendedPlayersMax: draft.recommendedPlayersMax ?? null,
              estimatedMinutes: draft.estimatedMinutes ?? null,
              tags: draft.tags,
            },
            include: { questions: true, author: true },
          })
        : await tx.quiz.create({
            data: {
              title: draft.title,
              description: draft.description ?? null,
              category: toPrismaQuizCategory[draft.category as WritableQuizCategory],
              difficulty: toPrismaDifficulty[draft.difficulty],
              status: toPrismaQuizStatus[QuizStatus.DRAFT],
              coverUrl: draft.coverUrl ?? null,
              themeColor: draft.themeColor ?? null,
              recommendedPlayersMin: draft.recommendedPlayersMin ?? null,
              recommendedPlayersMax: draft.recommendedPlayersMax ?? null,
              estimatedMinutes: draft.estimatedMinutes ?? null,
              tags: draft.tags,
              authorId: actor.id,
            },
            include: { questions: true, author: true },
          });

      const existingQuestionIds = draft.questions
        .map((question) => question.id)
        .filter((questionId): questionId is string => Boolean(questionId));

      await tx.question.deleteMany({
        where: {
          quizId: saved.id,
          ...(existingQuestionIds.length ? { id: { notIn: existingQuestionIds } } : {}),
        },
      });

      const newQuestions: Prisma.QuestionCreateManyInput[] = [];
      for (const question of draft.questions) {
        const questionData: Prisma.QuestionCreateManyInput = {
          quizId: saved.id,
          questionText: question.questionText,
          mediaUrl: question.media?.url ?? null,
          mediaType: question.media?.type ? toPrismaMediaType[question.media.type] : null,
          mediaAlt: question.media?.alt ?? null,
          mediaStartMs: question.media?.startMs ?? null,
          mediaEndMs: question.media?.endMs ?? null,
          mediaPosterUrl: question.media?.posterUrl ?? null,
          mediaPrompt: question.media?.prompt ?? null,
          revealMediaUrl: question.revealMedia?.url ?? null,
          revealMediaType: question.revealMedia?.type
            ? toPrismaMediaType[question.revealMedia.type]
            : null,
          revealMediaAlt: question.revealMedia?.alt ?? null,
          revealMediaStartMs: question.revealMedia?.startMs ?? null,
          revealMediaEndMs: question.revealMedia?.endMs ?? null,
          revealMediaPosterUrl: question.revealMedia?.posterUrl ?? null,
          revealMediaPrompt: question.revealMedia?.prompt ?? null,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation ?? null,
          order: question.order,
        };

        if (question.id) {
          // updateMany со скоупом по quizId: чужой question.id (не из этого
          // квиза) не перезаписывается — count 0, тихо игнорируется (анти-IDOR).
          await tx.question.updateMany({
            where: { id: question.id, quizId: saved.id },
            data: questionData,
          });
        } else {
          newQuestions.push(questionData);
        }
      }
      if (newQuestions.length) {
        await tx.question.createMany({ data: newQuestions });
      }

      return tx.quiz.findUniqueOrThrow({
        where: { id: saved.id },
        include: { questions: true, author: true },
      });
    });

    await this.cleanupReplacedMedia(
      previousMediaUrls,
      this.collectQuizMediaUrls(savedWithQuestions),
      savedWithQuestions.id,
    );

    return {
      quiz: mapQuizDraft(savedWithQuestions),
      validation: validateQuizDraft(savedWithQuestions),
      savedAt: new Date().toISOString(),
    };
  }

  async submitForReview(quizId: string, actor: UserSummary): Promise<QuizDraft> {
    const existing = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { authorId: true },
    });
    if (!existing) throw new NotFoundException('Quiz not found');
    this.assertCanManageQuiz(existing, actor);

    const quiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: { status: toPrismaQuizStatus[QuizStatus.PENDING_REVIEW], submittedAt: new Date() },
      include: { questions: true, author: true },
    });

    return mapQuizDraft(quiz);
  }

  async getReviewQueue(filters: ReviewQueueFilters): Promise<ReviewQueue> {
    const where = {
      status: toPrismaQuizStatus[filters.status ?? QuizStatus.PENDING_REVIEW],
      ...(filters.category && filters.category !== QuizCategory.ALL
        ? { category: toPrismaQuizCategory[filters.category] }
        : {}),
      ...(filters.difficulty ? { difficulty: toPrismaDifficulty[filters.difficulty] } : {}),
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

    const queueItems = items.map((quiz) => ({
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

    // Решение по ревью + запись в журнал — атомарно; решать можно только
    // квиз, реально находящийся на ревью (нельзя «одобрить» DRAFT).
    const quiz = await this.prisma.$transaction(async (tx) => {
      const current = await tx.quiz.findUnique({
        where: { id: payload.quizId },
        select: { status: true },
      });
      if (!current) throw new NotFoundException('Quiz not found');
      if (current.status !== toPrismaQuizStatus[QuizStatus.PENDING_REVIEW]) {
        throw new BadRequestException('Quiz is not pending review');
      }

      const updated = await tx.quiz.update({
        where: { id: payload.quizId },
        data: {
          status: toPrismaQuizStatus[nextStatus],
          approvedAt: payload.approve ? new Date() : null,
          rejectionReason: payload.approve
            ? null
            : (payload.comment ?? payload.reasons.join(', ')),
        },
        include: { questions: true, author: true },
      });

      await tx.quizReview.create({
        data: {
          quizId: payload.quizId,
          reviewerId,
          fromStatus: current.status,
          toStatus: toPrismaQuizStatus[nextStatus],
          reasons: payload.reasons,
          comment: payload.comment ?? null,
        },
      });

      return updated;
    });

    return mapQuizDraft(quiz);
  }

  async deleteQuiz(quizId: string, actor: UserSummary): Promise<void> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    this.assertCanManageQuiz(quiz, actor);
    const mediaUrls = this.collectQuizMediaUrls(quiz);
    await this.prisma.quiz.delete({ where: { id: quizId } });
    await this.cleanupUnusedLocalMedia(mediaUrls);
  }

  async deleteUploadedMediaAsset(url: string, actor: UserSummary): Promise<void> {
    if (!url) throw new BadRequestException('Media url is required');

    // Если у медиа есть владелец — удалять может только он или ADMIN.
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { url },
      select: { ownerId: true },
    });
    if (
      asset?.ownerId &&
      actor.role !== Role.ADMIN &&
      asset.ownerId !== actor.id
    ) {
      throw new ForbiddenException('You do not have access to this media');
    }

    await this.cleanupUnusedLocalMedia([url]);
  }

  private getUploadRoot(): string {
    return resolveUploadRoot(this.config.get<string>('UPLOAD_ROOT_DIR', 'uploads'));
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
