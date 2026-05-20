import { BACKEND_ORIGIN } from '@shared/config/backend.example';

export function getMediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
  return url;
}
