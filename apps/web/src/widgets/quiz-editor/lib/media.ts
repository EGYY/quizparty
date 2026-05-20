import { useEffect, useState } from 'react';
import { MediaType } from '@quizparty/shared';

export function useObjectUrl(file: File | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return undefined;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return url;
}

export function getMediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith('audio/')) return MediaType.AUDIO;
  if (file.type.startsWith('video/')) return MediaType.VIDEO;
  return MediaType.IMAGE;
}
