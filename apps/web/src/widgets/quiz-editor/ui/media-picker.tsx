import { memo } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { MediaType } from '@quizparty/shared';
import { resolveAssetUrl } from '@shared/lib/assets';
import { useObjectUrl } from '../lib/media';
import styles from './quiz-editor.module.scss';

export const MediaPicker = memo(function MediaPicker({
  accept,
  currentType,
  currentUrl,
  description,
  pendingFile,
  title,
  onClear,
  onSelect,
}: {
  accept: string;
  currentType?: MediaType | undefined;
  currentUrl: string | undefined;
  description: string;
  pendingFile: File | undefined;
  title: string;
  onClear: () => void;
  onSelect: (file: File) => void;
}) {
  const pendingUrl = useObjectUrl(pendingFile);
  const previewUrl = pendingUrl ?? resolveAssetUrl(currentUrl);

  const mediaKind: 'audio' | 'video' | 'image' = pendingFile
    ? pendingFile.type.startsWith('audio/')
      ? 'audio'
      : pendingFile.type.startsWith('video/')
        ? 'video'
        : 'image'
    : currentType === MediaType.AUDIO
      ? 'audio'
      : currentType === MediaType.VIDEO
        ? 'video'
        : 'image';

  return (
    <div className={styles.mediaPicker}>
      <label className={styles.mediaDropzone}>
        <input
          accept={accept}
          type="file"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) onSelect(file);
            e.currentTarget.value = '';
          }}
        />
        <UploadCloud size={34} />
        <strong>{pendingFile ? pendingFile.name : title}</strong>
        <span>{pendingFile ? 'Будет загружено при сохранении' : description}</span>
      </label>
      <div className={styles.mediaPreviewBox}>
        {previewUrl ? (
          mediaKind === 'audio' ? (
            <audio className={styles.mediaPreviewAudio} controls src={previewUrl} />
          ) : mediaKind === 'video' ? (
            <video className={styles.mediaPreviewVideo} controls src={previewUrl} />
          ) : (
            <img alt="" loading="lazy" src={previewUrl} />
          )
        ) : (
          <ImagePlus size={34} />
        )}
        <button
          className={`icon-button tiny danger ${styles.mediaClear}`}
          type="button"
          onClick={onClear}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
});
