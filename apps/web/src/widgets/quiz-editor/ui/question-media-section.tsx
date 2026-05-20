import { memo, useCallback } from 'react';
import type { QuizDraftQuestion } from '@quizparty/shared';
import { pickQuizMediaTiming } from '@entities/quiz';
import { defaultCoverUrl } from '@shared/lib/assets';
import { getMediaTypeFromFile } from '../lib/media';
import { MediaPicker } from './media-picker';
import styles from './quiz-editor.module.scss';

export const QuestionMediaSection = memo(function QuestionMediaSection({
  currentMedia,
  pendingFile,
  title,
  uploadTitle,
  onChange,
  onFileChange,
}: {
  currentMedia: QuizDraftQuestion['media'];
  pendingFile: File | undefined;
  title: string;
  uploadTitle: string;
  onChange: (media: QuizDraftQuestion['media']) => void;
  onFileChange: (file: File | undefined) => void;
}) {
  const patchMedia = useCallback(
    (patch: Partial<NonNullable<QuizDraftQuestion['media']>>) => {
      if (!currentMedia) return;
      onChange({ ...currentMedia, ...patch });
    },
    [currentMedia, onChange],
  );

  return (
    <div className={styles.field}>
      <span className={styles.label}>{title}</span>
      <MediaPicker
        accept="image/*,audio/*,video/*"
        currentType={currentMedia?.type}
        currentUrl={currentMedia?.url}
        description="Файл загрузится при сохранении квиза."
        pendingFile={pendingFile}
        title={uploadTitle}
        onClear={() => {
          onFileChange(undefined);
          onChange(undefined);
        }}
        onSelect={(file) => {
          onFileChange(file);
          onChange({
            url: currentMedia?.url ?? defaultCoverUrl,
            type: getMediaTypeFromFile(file),
            ...pickQuizMediaTiming(currentMedia),
          });
        }}
      />
      {currentMedia ? (
        <div className={styles.mediaTimingGrid}>
          <label>
            Старт, мс
            <input
              min={0}
              placeholder="0"
              type="number"
              value={currentMedia.startMs ?? ''}
              onChange={(e) =>
                patchMedia({ startMs: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </label>
          <label>
            Конец, мс
            <input
              min={0}
              placeholder="15000"
              type="number"
              value={currentMedia.endMs ?? ''}
              onChange={(e) =>
                patchMedia({ endMs: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </label>
          <label>
            Подсказка
            <input
              maxLength={160}
              placeholder="Послушайте фрагмент"
              value={currentMedia.prompt ?? ''}
              onChange={(e) => patchMedia({ prompt: e.target.value || undefined })}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
});
