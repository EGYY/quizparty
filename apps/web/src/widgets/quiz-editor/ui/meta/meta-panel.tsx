import { memo } from 'react';
import { QuizStatus } from '@quizparty/shared';
import type { QuizDraft } from '@quizparty/shared';
import { categoryOptions, difficultyOptions, labels, StatusPill } from '@entities/quiz';
import { Eyebrow, Select } from '@shared/ui';
import type { DraftErrors } from '../../model/types';
import { FieldError } from '../field-error';
import { MediaPicker } from '../media/media-picker';
import editorStyles from '../quiz-editor.module.scss';
import styles from './meta-panel.module.scss';

export const MetaPanel = memo(function MetaPanel({
  canEditStatus,
  draft,
  errors,
  pendingCoverFile,
  setField,
  onCoverFileChange,
}: {
  canEditStatus: boolean;
  draft: QuizDraft;
  errors: DraftErrors;
  pendingCoverFile: File | undefined;
  setField: <K extends keyof QuizDraft>(field: K, value: QuizDraft[K]) => void;
  onCoverFileChange: (file: File | undefined) => void;
}) {
  return (
    <div className={styles.meta}>
      <Eyebrow>Квиз</Eyebrow>

      <div className={editorStyles.field}>
        <label className={editorStyles.label}>Категория</label>
        <Select
          value={draft.category}
          onChange={(e) => setField('category', e.target.value as QuizDraft['category'])}
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {labels[cat]}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.fieldRow}>
        <div className={editorStyles.field}>
          <label className={editorStyles.label}>Сложность</label>
          <Select
            value={draft.difficulty}
            onChange={(e) => setField('difficulty', e.target.value as QuizDraft['difficulty'])}
          >
            {difficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {labels[difficulty]}
              </option>
            ))}
          </Select>
        </div>
        <div className={editorStyles.field}>
          <label className={editorStyles.label}>Цвет</label>
          <input
            type="color"
            value={draft.themeColor ?? '#ffb45f'}
            onChange={(e) => setField('themeColor', e.target.value)}
          />
        </div>
      </div>

      <div className={`${editorStyles.field}${errors.cover ? ` ${editorStyles.hasError}` : ''}`}>
        <span className={`${editorStyles.label} ${editorStyles.required}`}>Обложка</span>
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

      <div
        className={`${editorStyles.field}${errors.description ? ` ${editorStyles.hasError}` : ''}`}
      >
        <label className={`${editorStyles.label} ${editorStyles.required}`}>Описание</label>
        <textarea
          placeholder="Краткое описание квиза…"
          rows={3}
          value={draft.description ?? ''}
          onChange={(e) => setField('description', e.target.value)}
        />
        <FieldError message={errors.description} />
      </div>

      <div className={editorStyles.field}>
        <label className={editorStyles.label}>Теги</label>
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

      <div className={editorStyles.field}>
        <label className={editorStyles.label}>Статус</label>
        {canEditStatus ? (
          <Select
            value={draft.status}
            onChange={(e) => setField('status', e.target.value as QuizStatus)}
          >
            {Object.values(QuizStatus).map((status) => (
              <option key={status} value={status}>
                {labels[status]}
              </option>
            ))}
          </Select>
        ) : (
          <div className={styles.statusReadOnly}>
            <StatusPill status={draft.status} />
            <small>Публикация доступна после ревью администратора.</small>
          </div>
        )}
      </div>
    </div>
  );
});
