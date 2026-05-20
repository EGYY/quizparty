import type { QuizDraft, SaveQuizDraftResponse } from '@quizparty/shared';
import { http } from '@shared/api/http';

export async function getDraft(quizId: string, signal?: AbortSignal): Promise<QuizDraft> {
  const { data } = await http.get<QuizDraft>(
    `/quizzes/${quizId}/draft`,
    signal ? { signal } : undefined,
  );
  return data;
}

export async function saveDraft(draft: QuizDraft): Promise<SaveQuizDraftResponse> {
  const { data } = await http.put<SaveQuizDraftResponse>('/quizzes/draft', draft);
  return data;
}

export async function submitForReview(quizId: string): Promise<QuizDraft> {
  const { data } = await http.post<QuizDraft>(`/quizzes/${quizId}/submit-review`);
  return data;
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await http.delete(`/quizzes/${quizId}`);
}
