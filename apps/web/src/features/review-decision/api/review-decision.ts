import type { QuizDraft, ReviewDecisionBody } from '@quizparty/shared';
import { http } from '@shared/api/http';

export async function reviewQuiz(quizId: string, decision: ReviewDecisionBody): Promise<QuizDraft> {
  const { data } = await http.post<QuizDraft>(`/admin/review/${quizId}/decision`, decision);
  return data;
}
