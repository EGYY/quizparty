import { memo, useCallback } from 'react';
import type { QuizDraftQuestion } from '@quizparty/shared';
import { pickQuizMediaTiming } from '@entities/quiz';
import { defaultCoverUrl } from '@shared/lib';
import { getMediaTypeFromFile } from '../lib/media';
import { MediaPicker } from './media/media-picker';
import { QuestionTimingField } from './question/question-timing-field';
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
          <QuestionTimingField
            label="Старт, мс"
            min={0}
            placeholder="0"
            type="number"
            value={currentMedia.startMs}
            onChange={(value) => patchMedia({ startMs: value ? Number(value) : undefined })}
          />
          <QuestionTimingField
            label="Конец, мс"
            min={0}
            placeholder="15000"
            type="number"
            value={currentMedia.endMs}
            onChange={(value) => patchMedia({ endMs: value ? Number(value) : undefined })}
          />
          <QuestionTimingField
            label="Подсказка"
            maxLength={160}
            placeholder="Послушайте фрагмент"
            value={currentMedia.prompt}
            onChange={(value) => patchMedia({ prompt: value || undefined })}
          />
        </div>
      ) : null}
    </div>
  );
});
