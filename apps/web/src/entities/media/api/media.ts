import type { Media, MediaUploadResponse } from '@quizparty/shared';
import { http } from '@shared/api/http';

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
