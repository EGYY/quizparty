import { PrismaClient } from '@prisma/client';
import { scryptSync } from 'node:crypto';
import { allQuizzes } from './seed-data/index';

const prisma = new PrismaClient();

// Fixed salt — deterministic hashes for local dev (not for production)
const DEV_SALT = 'quizparty-dev-2026';

function hashPassword(password: string): string {
  const key = scryptSync(password, DEV_SALT, 64).toString('base64url');
  return `scrypt:${DEV_SALT}:${key}`;
}

function stableQuizId(title: string): string {
  const source = Buffer.from(title).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${source.slice(0, 8)}-${source.slice(8, 12)}-4${source.slice(13, 16)}-a${source.slice(17, 20)}-${source.slice(20, 32)}`;
}

async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@quizparty.local' },
    update: {
      passwordHash: hashPassword('local-dev'),
      displayName: 'QuizParty Admin',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@quizparty.local',
      passwordHash: hashPassword('local-dev'),
      displayName: 'QuizParty Admin',
      role: 'ADMIN',
      avatarUrl: 'http://localhost:5173/assets/avatars/admin.svg',
    },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@quizparty.local' },
    update: {
      passwordHash: hashPassword('local-dev'),
      displayName: 'QuizMaster',
    },
    create: {
      email: 'author@quizparty.local',
      passwordHash: hashPassword('local-dev'),
      displayName: 'QuizMaster',
      role: 'AUTHOR',
    },
  });

  // ── Quizzes ────────────────────────────────────────────────────────────────
  for (const quiz of allQuizzes) {
    const quizId = stableQuizId(quiz.title);

    const saved = await prisma.quiz.upsert({
      where: { id: quizId },
      update: {
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        coverUrl: quiz.coverUrl,
        squareCoverUrl: quiz.squareCoverUrl,
        themeColor: quiz.themeColor,
        recommendedPlayersMin: quiz.recommendedPlayersMin,
        recommendedPlayersMax: quiz.recommendedPlayersMax,
        estimatedMinutes: quiz.estimatedMinutes,
        tags: quiz.tags,
        status: 'APPROVED',
        authorId: author.id,
      },
      create: {
        id: quizId,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        coverUrl: quiz.coverUrl,
        squareCoverUrl: quiz.squareCoverUrl,
        themeColor: quiz.themeColor,
        recommendedPlayersMin: quiz.recommendedPlayersMin,
        recommendedPlayersMax: quiz.recommendedPlayersMax,
        estimatedMinutes: quiz.estimatedMinutes,
        tags: quiz.tags,
        status: 'APPROVED',
        authorId: author.id,
      },
    });

    // Replace questions on every run (idempotent)
    await prisma.question.deleteMany({ where: { quizId: saved.id } });
    await prisma.question.createMany({
      data: quiz.questions.map((q) => ({
        quizId: saved.id,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: q.order,
        mediaUrl: q.mediaUrl ?? null,
        mediaType: q.mediaType ?? null,
        mediaAlt: q.mediaAlt ?? null,
        mediaStartMs: q.mediaStartMs ?? null,
        mediaEndMs: q.mediaEndMs ?? null,
        mediaPosterUrl: q.mediaPosterUrl ?? null,
        mediaPrompt: q.mediaPrompt ?? null,
        revealMediaUrl: q.revealMediaUrl ?? null,
        revealMediaType: q.revealMediaType ?? null,
        revealMediaAlt: q.revealMediaAlt ?? null,
        revealMediaStartMs: q.revealMediaStartMs ?? null,
        revealMediaEndMs: q.revealMediaEndMs ?? null,
        revealMediaPosterUrl: q.revealMediaPosterUrl ?? null,
        revealMediaPrompt: q.revealMediaPrompt ?? null,
      })),
    });

    console.log(`  ✓ ${quiz.category} / ${quiz.difficulty} — ${quiz.title}`);
  }

  console.log(
    `\n✅ Seeded ${allQuizzes.length} quizzes (${allQuizzes.reduce((s, q) => s + q.questions.length, 0)} questions)`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
