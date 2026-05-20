import type { QuizDraft } from '@quizparty/shared';
import { uploadMediaFile } from '@entities/media';
import { pickQuizMediaTiming } from '@entities/quiz';
import type { PendingMedia } from '../model/types';

export async function uploadPendingMedia(
  source: QuizDraft,
  pendingMedia: PendingMedia,
): Promise<{ draft: QuizDraft; uploadedUrls: string[] }> {
  const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;
  const uploadCache = new Map<string, ReturnType<typeof uploadMediaFile>>();
  const getOrUpload = (file: File, alt: string) => {
    const key = fileKey(file);
    if (!uploadCache.has(key)) uploadCache.set(key, uploadMediaFile(file, alt));
    return uploadCache.get(key)!;
  };

  const questionTasks = [
    ...Object.entries(pendingMedia.questions).map(([index, file]) => ({
      field: 'media' as const,
      index: Number(index),
      file,
      alt: source.questions[Number(index)]?.questionText || file.name,
    })),
    ...Object.entries(pendingMedia.revealQuestions).map(([index, file]) => ({
      field: 'revealMedia' as const,
      index: Number(index),
      file,
      alt: source.questions[Number(index)]?.questionText || file.name,
    })),
  ];

  const [coverUpload, questionUploads] = await Promise.all([
    pendingMedia.cover ? getOrUpload(pendingMedia.cover, source.title) : Promise.resolve(undefined),
    Promise.all(
      questionTasks.map(async (task) => ({
        field: task.field,
        index: task.index,
        media: (await getOrUpload(task.file, task.alt)).media,
      })),
    ),
  ]);

  const uploadedUrls: string[] = [];
  if (coverUpload) uploadedUrls.push(coverUpload.media.url);

  const seenUrls = new Set<string>();
  questionUploads.forEach((item) => {
    if (!seenUrls.has(item.media.url)) {
      seenUrls.add(item.media.url);
      uploadedUrls.push(item.media.url);
    }
  });

  if (!coverUpload && !questionUploads.length) return { draft: source, uploadedUrls };

  const mediaByQuestionIndex = new Map(
    questionUploads
      .filter((item) => item.field === 'media')
      .map((item) => [item.index, item.media]),
  );
  const revealMediaByQuestionIndex = new Map(
    questionUploads
      .filter((item) => item.field === 'revealMedia')
      .map((item) => [item.index, item.media]),
  );

  return {
    uploadedUrls,
    draft: {
      ...source,
      ...(coverUpload ? { coverUrl: coverUpload.media.url } : {}),
      questions: source.questions.map((question, index) => {
        const media = mediaByQuestionIndex.get(index);
        const revealMedia = revealMediaByQuestionIndex.get(index);
        return {
          ...question,
          ...(media ? { media: { ...media, ...pickQuizMediaTiming(question.media) } } : {}),
          ...(revealMedia
            ? { revealMedia: { ...revealMedia, ...pickQuizMediaTiming(question.revealMedia) } }
            : {}),
        };
      }),
    },
  };
}
