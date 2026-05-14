import type {
  AdminDashboard,
  AdminQuizList,
  AdminQuizListFilters,
  Media,
  MediaUploadResponse,
  QuizDraft,
  ReviewDecisionBody,
  ReviewQueue,
  ReviewQueueFilters,
  SaveQuizDraftResponse,
} from '@quizparty/shared';
import { QuizCategory } from '@quizparty/shared';
import { http } from './http';

const cleanParams = <
  T extends { category?: QuizCategory | undefined; tags?: string[] | undefined },
>(
  filters: T,
) => ({
  ...filters,
  category: filters.category === QuizCategory.ALL ? undefined : filters.category,
  tags: filters.tags?.length ? filters.tags : undefined,
});

export async function getDashboard(): Promise<AdminDashboard> {
  const { data } = await http.get<AdminDashboard>('/admin/dashboard');
  return data;
}

export async function listAdminQuizzes(filters: AdminQuizListFilters): Promise<AdminQuizList> {
  const { data } = await http.get<AdminQuizList>('/admin/quizzes', {
    params: cleanParams(filters),
  });
  return data;
}

export async function getReviewQueue(filters: ReviewQueueFilters): Promise<ReviewQueue> {
  const { data } = await http.get<ReviewQueue>('/admin/review', {
    params: cleanParams(filters),
  });
  return data;
}

export async function createMediaAsset(media: Media): Promise<MediaUploadResponse> {
  const { data } = await http.post<MediaUploadResponse>('/admin/media', media);
  return data;
}

export async function uploadMediaFile(file: File, alt?: string): Promise<MediaUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  if (alt?.trim()) form.append('alt', alt.trim());

  // timeout: 0 — без лимита, т.к. видео/аудио файлы могут грузиться дольше 8с
  const { data } = await http.post<MediaUploadResponse>('/admin/media/upload', form, {
    timeout: 0,
  });
  return data;
}

export async function deleteUploadedMedia(url: string): Promise<void> {
  await http.delete('/admin/media', { data: { url } });
}

export async function getDraft(quizId: string): Promise<QuizDraft> {
  const { data } = await http.get<QuizDraft>(`/quizzes/${quizId}/draft`);
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

export async function reviewQuiz(quizId: string, decision: ReviewDecisionBody): Promise<QuizDraft> {
  const { data } = await http.post<QuizDraft>(`/admin/review/${quizId}/decision`, decision);
  return data;
}
