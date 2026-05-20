import type { QuizDraftQuestion } from '@quizparty/shared';

export function pickQuizMediaTiming(media: QuizDraftQuestion['media']) {
  return {
    ...(typeof media?.startMs === 'number' ? { startMs: media.startMs } : {}),
    ...(typeof media?.endMs === 'number' ? { endMs: media.endMs } : {}),
    ...(media?.posterUrl ? { posterUrl: media.posterUrl } : {}),
    ...(media?.prompt ? { prompt: media.prompt } : {}),
  };
}
