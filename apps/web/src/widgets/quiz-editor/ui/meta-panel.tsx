import { memo } from 'react';
import { QuizStatus } from '@quizparty/shared';
import type { QuizDraft } from '@quizparty/shared';
import { categoryOptions, difficultyOptions, labels } from '@entities/quiz';
import type { DraftErrors } from '../model/types';
import { FieldError } from './field-error';
import { MediaPicker } from './media-picker';
import styles from './quiz-editor.module.scss';

export const MetaPanel = memo(function MetaPanel({
  draft,
  errors,
  pendingCoverFile,
  setField,
  onCoverFileChange,
}: {
  draft: QuizDraft;
  errors: DraftErrors;
  pendingCoverFile: File | undefined;
  setField: <K extends keyof QuizDraft>(field: K, value: QuizDraft[K]) => void;
  onCoverFileChange: (file: File | undefined) => void;
}) {
  return (
    <div className={styles.meta}>
      <p className="eyebrow">Квиз</p>

      <div className={styles.field}>
        <label className={styles.label}>Категория</label>
        <select
          value={draft.category}
          onChange={(e) => setField('category', e.target.value as QuizDraft['category'])}
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {labels[cat]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Сложность</label>
          <select
            value={draft.difficulty}
            onChange={(e) => setField('difficulty', e.target.value as QuizDraft['difficulty'])}
          >
            {difficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {labels[difficulty]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Цвет</label>
          <input
            type="color"
            value={draft.themeColor ?? '#ffb45f'}
            onChange={(e) => setField('themeColor', e.target.value)}
          />
        </div>
      </div>

      <div className={`${styles.field}${errors.cover ? ` ${styles.hasError}` : ''}`}>
        <span className={styles.label}>Обложка</span>
        <MediaPicker
          accept="image/*"
          currentUrl={draft.coverUrl}
          description="PNG, JPG, WEBP до 10 МБ"
          pendingFile={pendingCoverFile}
          title="Загрузить обложку"
          onClear={() => {
            onCoverFileChange(undefined);
            setField('coverUrl', undefined);
          }}
          onSelect={(file) => {
            onCoverFileChange(file);
            setField('coverUrl', draft.coverUrl);
          }}
        />
        <FieldError message={errors.cover} />
      </div>

      <div className={`${styles.field}${errors.description ? ` ${styles.hasError}` : ''}`}>
        <label className={styles.label}>Описание</label>
        <textarea
          placeholder="Краткое описание квиза…"
          rows={3}
          value={draft.description ?? ''}
          onChange={(e) => setField('description', e.target.value)}
        />
        <FieldError message={errors.description} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Теги</label>
        <input
          placeholder="вечеринка, кино, …"
          value={draft.tags.join(', ')}
          onChange={(e) =>
            setField(
              'tags',
              e.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Статус</label>
        <select
          value={draft.status}
          onChange={(e) => setField('status', e.target.value as QuizStatus)}
        >
          {Object.values(QuizStatus).map((status) => (
            <option key={status} value={status}>
              {labels[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});
