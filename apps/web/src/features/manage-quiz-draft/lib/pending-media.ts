import type { PendingMedia } from '../model/types';

export const emptyPendingMedia = (): PendingMedia => ({
  cover: undefined,
  questions: {},
  revealQuestions: {},
});

export function shiftPendingMediaAfterQuestionRemoved(
  current: PendingMedia,
  removedIndex: number,
): PendingMedia {
  const nextQuestions: Record<number, File> = {};
  const nextRevealQuestions: Record<number, File> = {};

  Object.entries(current.questions).forEach(([key, file]) => {
    const currentIndex = Number(key);
    if (currentIndex < removedIndex) nextQuestions[currentIndex] = file;
    if (currentIndex > removedIndex) nextQuestions[currentIndex - 1] = file;
  });

  Object.entries(current.revealQuestions).forEach(([key, file]) => {
    const currentIndex = Number(key);
    if (currentIndex < removedIndex) nextRevealQuestions[currentIndex] = file;
    if (currentIndex > removedIndex) nextRevealQuestions[currentIndex - 1] = file;
  });

  return { ...current, questions: nextQuestions, revealQuestions: nextRevealQuestions };
}
