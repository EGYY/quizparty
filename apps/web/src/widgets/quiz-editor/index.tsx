import { memo, useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Plus,
  Save,
  Send,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { MediaType, QuizStatus } from '@quizparty/shared';
import type { QuizDraft, QuizDraftQuestion } from '@quizparty/shared';
import { emptyQuestion, localValidation, type SaveState } from '@entities/quiz/model';
import { categoryOptions, difficultyOptions, labels } from '@shared/config/labels';
import { resolveAssetUrl } from '@shared/lib/assets';

// ─── Error types ──────────────────────────────────────────────────────────────

type QuestionErrors = {
  questionText: string | undefined;
  options: (string | undefined)[];
};

type DraftErrors = {
  title: string | undefined;
  description: string | undefined;
  cover: string | undefined;
  questions: QuestionErrors[];
};

const EMPTY_ERRORS: DraftErrors = {
  title: undefined,
  description: undefined,
  cover: undefined,
  questions: [],
};

function computeErrors(draft: QuizDraft): DraftErrors {
  return {
    title: draft.title.trim() ? undefined : 'Введите название',
    description: draft.description?.trim() ? undefined : 'Добавьте описание',
    cover: draft.coverUrl ? undefined : 'Загрузите обложку',
    questions: draft.questions.map((q) => ({
      questionText: q.questionText.trim() ? undefined : 'Введите текст вопроса',
      options: q.options.map((opt) => (opt.trim() ? undefined : 'Заполните вариант')),
    })),
  };
}

function questionErrorCount(errors: DraftErrors, index: number): number {
  const qe = errors.questions[index];
  if (!qe) return 0;
  return (qe.questionText ? 1 : 0) + qe.options.filter(Boolean).length;
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <span className="qe-field-error">
      <AlertCircle size={12} />
      {message}
    </span>
  );
}

function SaveStateBadge({ state }: { state: SaveState }) {
  const text = {
    idle: 'Готово',
    dirty: 'Изменения',
    saving: 'Сохранение…',
    saved: 'Сохранено',
    error: 'Ошибка',
  }[state];
  return <span className={`save-state ${state}`}>{text}</span>;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ─── QuizEditor ───────────────────────────────────────────────────────────────

export const QuizEditor = memo(function QuizEditor({
  draft,
  canDelete,
  saveState,
  isDeleting,
  isSaving,
  isSubmitting,
  pendingCoverFile,
  pendingQuestionMediaFiles,
  pendingQuestionRevealMediaFiles,
  onChange,
  onCoverFileChange,
  onQuestionMediaFileChange,
  onQuestionRevealMediaFileChange,
  onQuestionRemoved,
  onDelete,
  onSave,
  onSubmit,
}: {
  draft: QuizDraft;
  canDelete: boolean;
  saveState: SaveState;
  isDeleting: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  pendingCoverFile: File | undefined;
  pendingQuestionMediaFiles: Record<number, File>;
  pendingQuestionRevealMediaFiles: Record<number, File>;
  onChange: (draft: QuizDraft) => void;
  onCoverFileChange: (file: File | undefined) => void;
  onQuestionMediaFileChange: (index: number, file: File | undefined) => void;
  onQuestionRevealMediaFileChange: (index: number, file: File | undefined) => void;
  onQuestionRemoved: (index: number) => void;
  onDelete: () => void;
  onSave: () => void;
  onSubmit: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const allErrors = computeErrors(draft);
  const validation = draft.validation.length ? draft.validation : localValidation(draft);
  const canSubmit = validation.every((item) => item.passed);

  const safeIndex = Math.max(0, Math.min(selectedIndex, draft.questions.length - 1));
  const selectedQuestion = draft.questions[safeIndex];

  // Reset when switching between quizzes
  useEffect(() => {
    setSelectedIndex(0);
    setShowErrors(false);
  }, [draft.id]);

  const setField = useCallback(
    <K extends keyof QuizDraft>(field: K, value: QuizDraft[K]) =>
      onChange({ ...draft, [field]: value }),
    [draft, onChange],
  );

  const setQuestion = useCallback(
    (index: number, patch: Partial<QuizDraftQuestion>) => {
      onChange({
        ...draft,
        questions: draft.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
      });
    },
    [draft, onChange],
  );

  const addQuestion = useCallback(() => {
    const newIndex = draft.questions.length;
    onChange({ ...draft, questions: [...draft.questions, emptyQuestion(newIndex)] });
    setSelectedIndex(newIndex);
  }, [draft, onChange]);

  const removeQuestion = useCallback(
    (index: number) => {
      onQuestionRemoved(index);
      onChange({
        ...draft,
        questions: draft.questions
          .filter((_, i) => i !== index)
          .map((q, order) => ({ ...q, order })),
      });
      setSelectedIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
    },
    [draft, onChange, onQuestionRemoved],
  );

  const handleSave = useCallback(() => {
    setShowErrors(true);
    onSave();
  }, [onSave]);

  const handleSubmit = useCallback(() => {
    setShowErrors(true);
    onSubmit();
  }, [onSubmit]);

  const visibleErrors = showErrors ? allErrors : EMPTY_ERRORS;
  const emptyQuestionErrors: QuestionErrors = { questionText: undefined, options: [] };
  const selectedQuestionErrors: QuestionErrors = showErrors
    ? (allErrors.questions[safeIndex] ?? emptyQuestionErrors)
    : emptyQuestionErrors;

  return (
    <div className="qe-root">
      {/* Sticky editor header */}
      <header className="qe-header">
        <div className="qe-header-left">
          <input
            className={`qe-title-input${showErrors && allErrors.title ? ' qe-title-input--error' : ''}`}
            placeholder="Название квиза"
            value={draft.title}
            onChange={(e) => setField('title', e.target.value)}
          />
          {showErrors && allErrors.title ? <FieldError message={allErrors.title} /> : null}
          <SaveStateBadge state={saveState} />
        </div>
        <div className="qe-header-actions">
          {canDelete ? (
            <button
              className="danger-button"
              disabled={isDeleting}
              type="button"
              onClick={onDelete}
            >
              <Trash2 size={15} />
              <span className="qe-btn-label">Удалить</span>
            </button>
          ) : null}
          <button
            className="secondary-button"
            disabled={isSaving}
            type="button"
            onClick={handleSave}
          >
            <Save size={15} />
            <span className="qe-btn-label">{isSaving ? 'Сохранение…' : 'Сохранить'}</span>
          </button>
          <button
            className="primary-button"
            disabled={!canSubmit || isSubmitting}
            type="button"
            onClick={handleSubmit}
          >
            <Send size={15} />
            <span className="qe-btn-label">{isSubmitting ? 'Отправка…' : 'На ревью'}</span>
          </button>
        </div>
      </header>

      {/* Three-column body */}
      <div className="qe-body">
        {/* Left sidebar: quiz meta + question navigator */}
        <aside className="qe-sidebar">
          <MetaPanel
            draft={draft}
            errors={visibleErrors}
            pendingCoverFile={pendingCoverFile}
            setField={setField}
            onCoverFileChange={onCoverFileChange}
          />
          <QuestionNav
            draft={draft}
            errors={allErrors}
            selectedIndex={safeIndex}
            showErrors={showErrors}
            onAdd={addQuestion}
            onSelect={setSelectedIndex}
          />
        </aside>

        {/* Center: single question editor */}
        <main className="qe-main">
          {selectedQuestion ? (
            <QuestionEditorPanel
              count={draft.questions.length}
              errors={selectedQuestionErrors}
              index={safeIndex}
              pendingMediaFile={pendingQuestionMediaFiles[safeIndex]}
              pendingRevealMediaFile={pendingQuestionRevealMediaFiles[safeIndex]}
              question={selectedQuestion}
              onChange={(patch) => setQuestion(safeIndex, patch)}
              onMediaFileChange={(file) => onQuestionMediaFileChange(safeIndex, file)}
              onNavigate={setSelectedIndex}
              onRemove={() => removeQuestion(safeIndex)}
              onRevealMediaFileChange={(file) => onQuestionRevealMediaFileChange(safeIndex, file)}
            />
          ) : (
            <div className="qe-empty">
              <p>Нет вопросов. Добавьте первый!</p>
              <button className="primary-button" type="button" onClick={addQuestion}>
                <Plus size={16} />
                Добавить вопрос
              </button>
            </div>
          )}
        </main>

        {/* Right sidebar: TV preview + checklist */}
        <aside className="qe-side">
          <TVPreviewPanel
            draft={draft}
            pendingCoverFile={pendingCoverFile}
            question={selectedQuestion}
          />
          <ValidationPanel validation={validation} />
        </aside>
      </div>
    </div>
  );
});

// ─── MetaPanel ────────────────────────────────────────────────────────────────

const MetaPanel = memo(function MetaPanel({
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
    <div className="qe-meta">
      <p className="eyebrow">Квиз</p>

      <div className="qe-field">
        <label className="qe-label">Категория</label>
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

      <div className="qe-field-row">
        <div className="qe-field">
          <label className="qe-label">Сложность</label>
          <select
            value={draft.difficulty}
            onChange={(e) => setField('difficulty', e.target.value as QuizDraft['difficulty'])}
          >
            {difficultyOptions.map((d) => (
              <option key={d} value={d}>
                {labels[d]}
              </option>
            ))}
          </select>
        </div>
        <div className="qe-field">
          <label className="qe-label">Цвет</label>
          <input
            type="color"
            value={draft.themeColor ?? '#ffb45f'}
            onChange={(e) => setField('themeColor', e.target.value)}
          />
        </div>
      </div>

      <div className={`qe-field${errors.cover ? ' has-error' : ''}`}>
        <span className="qe-label">Обложка</span>
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

      <div className={`qe-field${errors.description ? ' has-error' : ''}`}>
        <label className="qe-label">Описание</label>
        <textarea
          placeholder="Краткое описание квиза…"
          rows={3}
          value={draft.description ?? ''}
          onChange={(e) => setField('description', e.target.value)}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="qe-field">
        <label className="qe-label">Теги</label>
        <input
          placeholder="вечеринка, кино, …"
          value={draft.tags.join(', ')}
          onChange={(e) =>
            setField(
              'tags',
              e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            )
          }
        />
      </div>

      <div className="qe-field">
        <label className="qe-label">Статус</label>
        <select
          value={draft.status}
          onChange={(e) => setField('status', e.target.value as QuizStatus)}
        >
          {Object.values(QuizStatus).map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

// ─── QuestionNav ──────────────────────────────────────────────────────────────

const QuestionNav = memo(function QuestionNav({
  draft,
  errors,
  selectedIndex,
  showErrors,
  onAdd,
  onSelect,
}: {
  draft: QuizDraft;
  errors: DraftErrors;
  selectedIndex: number;
  showErrors: boolean;
  onAdd: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="qe-nav">
      <div className="qe-nav-header">
        <span>Вопросы ({draft.questions.length})</span>
        <button className="icon-button" title="Добавить вопрос" type="button" onClick={onAdd}>
          <Plus size={15} />
        </button>
      </div>
      <div className="qe-nav-list">
        {draft.questions.map((q, i) => {
          const count = questionErrorCount(errors, i);
          return (
            <button
              className={`qe-nav-item${i === selectedIndex ? ' active' : ''}`}
              key={q.id ?? `q-nav-${i}`}
              type="button"
              onClick={() => onSelect(i)}
            >
              <span className="qe-nav-num">{i + 1}</span>
              <span className="qe-nav-text">{q.questionText || 'Новый вопрос'}</span>
              {showErrors && count > 0 ? <span className="qe-nav-badge">{count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ─── QuestionEditorPanel ──────────────────────────────────────────────────────

const QuestionEditorPanel = memo(function QuestionEditorPanel({
  count,
  errors,
  index,
  pendingMediaFile,
  pendingRevealMediaFile,
  question,
  onChange,
  onMediaFileChange,
  onNavigate,
  onRemove,
  onRevealMediaFileChange,
}: {
  count: number;
  errors: QuestionErrors;
  index: number;
  pendingMediaFile: File | undefined;
  pendingRevealMediaFile: File | undefined;
  question: QuizDraftQuestion;
  onChange: (patch: Partial<QuizDraftQuestion>) => void;
  onMediaFileChange: (file: File | undefined) => void;
  onNavigate: (index: number) => void;
  onRemove: () => void;
  onRevealMediaFileChange: (file: File | undefined) => void;
}) {
  const setOption = useCallback(
    (optionIndex: number, value: string) => {
      onChange({
        options: question.options.map((opt, i) => (i === optionIndex ? value : opt)),
      });
    },
    [onChange, question.options],
  );

  const emptyOptionsCount = errors.options.filter(Boolean).length;

  return (
    <div className="qe-question-panel">
      {/* Header: prev/next + delete */}
      <div className="qe-question-header">
        <div className="qe-question-nav">
          <button
            className="icon-button"
            disabled={index === 0}
            title="Предыдущий вопрос"
            type="button"
            onClick={() => onNavigate(index - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="qe-question-counter">
            Вопрос {index + 1} / {count}
          </span>
          <button
            className="icon-button"
            disabled={index === count - 1}
            title="Следующий вопрос"
            type="button"
            onClick={() => onNavigate(index + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          className="icon-button danger"
          title="Удалить вопрос"
          type="button"
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Question text */}
      <div className={`qe-field${errors.questionText ? ' has-error' : ''}`}>
        <label className="qe-label">Текст вопроса</label>
        <textarea
          className="qe-textarea-tall"
          placeholder="Введите текст вопроса…"
          value={question.questionText}
          onChange={(e) => onChange({ questionText: e.target.value })}
        />
        <FieldError message={errors.questionText} />
      </div>

      {/* Answer options */}
      <div className={`qe-field${emptyOptionsCount > 0 ? ' has-error' : ''}`}>
        <span className="qe-label">
          Варианты ответа <small>(нажмите на букву, чтобы отметить правильный)</small>
        </span>
        <div className="qe-options-grid">
          {question.options.map((opt, i) => (
            <div
              className={[
                'qe-option',
                question.correctIndex === i ? 'correct' : '',
                errors.options[i] ? 'has-error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={i}
            >
              <button
                className={`qe-option-btn${question.correctIndex === i ? ' correct' : ''}`}
                title={`Сделать вариант ${OPTION_LABELS[i]} правильным`}
                type="button"
                onClick={() => onChange({ correctIndex: i })}
              >
                {OPTION_LABELS[i]}
              </button>
              <input
                placeholder={`Вариант ${OPTION_LABELS[i]}…`}
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        {emptyOptionsCount > 0 ? (
          <FieldError message={`Заполните все варианты ответа (${emptyOptionsCount} пустых)`} />
        ) : null}
      </div>

      {/* Media sections */}
      <QuestionMediaSection
        currentMedia={question.media}
        pendingFile={pendingMediaFile}
        title="Медиа вопроса"
        uploadTitle="Изображение, видео или аудио"
        onChange={(media) => onChange({ media })}
        onFileChange={onMediaFileChange}
      />

      <QuestionMediaSection
        currentMedia={question.revealMedia}
        pendingFile={pendingRevealMediaFile}
        title="Медиа при показе ответа"
        uploadTitle="Расширенный фрагмент для правильного ответа"
        onChange={(revealMedia) => onChange({ revealMedia })}
        onFileChange={onRevealMediaFileChange}
      />

      {/* Explanation */}
      <div className="qe-field">
        <label className="qe-label">
          Объяснение <small>(необязательно)</small>
        </label>
        <textarea
          placeholder="Поясните правильный ответ…"
          value={question.explanation ?? ''}
          onChange={(e) => onChange({ explanation: e.target.value || undefined })}
        />
      </div>
    </div>
  );
});

// ─── QuestionMediaSection ─────────────────────────────────────────────────────

const QuestionMediaSection = memo(function QuestionMediaSection({
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
    <div className="qe-field">
      <span className="qe-label">{title}</span>
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
            url: currentMedia?.url ?? 'http://localhost:5173/assets/covers/party.svg',
            type: getMediaTypeFromFile(file),
            ...pickMediaTiming(currentMedia),
          });
        }}
      />
      {currentMedia ? (
        <div className="media-timing-grid">
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

// ─── TVPreviewPanel ───────────────────────────────────────────────────────────

const TVPreviewPanel = memo(function TVPreviewPanel({
  draft,
  pendingCoverFile,
  question,
}: {
  draft: QuizDraft;
  pendingCoverFile: File | undefined;
  question: QuizDraftQuestion | undefined;
}) {
  const pendingCoverUrl = useObjectUrl(pendingCoverFile);
  const cover = pendingCoverUrl ?? resolveAssetUrl(draft.coverUrl);

  return (
    <div className="panel qe-preview-panel">
      <p className="eyebrow">TV Preview</p>
      {cover ? (
        <div
          className="preview-card qe-cover-preview"
          style={{ backgroundColor: draft.themeColor ?? '#ffb45f' }}
        >
          <img alt="" loading="lazy" src={cover} />
          <span>{labels[draft.category]}</span>
          <h3 className="qe-cover-title">{draft.title || '—'}</h3>
        </div>
      ) : null}
      {question ? (
        <div className="qe-tv-mock">
          <p className="qe-tv-question">{question.questionText || 'Текст вопроса…'}</p>
          <div className="qe-tv-options">
            {question.options.map((opt, i) => (
              <div className={`qe-tv-opt${question.correctIndex === i ? ' correct' : ''}`} key={i}>
                <span>{OPTION_LABELS[i]}</span>
                <p>{opt || `Вариант ${OPTION_LABELS[i]}`}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

// ─── ValidationPanel ──────────────────────────────────────────────────────────

function ValidationPanel({ validation }: { validation: QuizDraft['validation'] }) {
  return (
    <section className="panel qe-checklist-panel">
      <h3 className="qe-checklist-title">Чеклист</h3>
      <div className="checklist">
        {validation.map((item) => (
          <div className={item.passed ? 'check-row passed' : 'check-row'} key={item.code}>
            {item.passed ? <Check size={14} /> : <X size={14} />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MediaPicker ──────────────────────────────────────────────────────────────

const MediaPicker = memo(function MediaPicker({
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

  // Determine effective media kind: pending file wins, otherwise use saved type
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
    <div className={'media-picker'}>
      <label className="media-dropzone">
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
      <div className="media-preview-box">
        {previewUrl ? (
          mediaKind === 'audio' ? (
            <audio className="media-preview-audio" controls src={previewUrl} />
          ) : mediaKind === 'video' ? (
            <video className="media-preview-video" controls src={previewUrl} />
          ) : (
            <img alt="" loading="lazy" src={previewUrl} />
          )
        ) : (
          <ImagePlus size={34} />
        )}
        <button className="icon-button tiny danger media-clear" type="button" onClick={onClear}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
});

// ─── Private helpers ──────────────────────────────────────────────────────────

function pickMediaTiming(media: QuizDraftQuestion['media']) {
  return {
    ...(typeof media?.startMs === 'number' ? { startMs: media.startMs } : {}),
    ...(typeof media?.endMs === 'number' ? { endMs: media.endMs } : {}),
    ...(media?.posterUrl ? { posterUrl: media.posterUrl } : {}),
    ...(media?.prompt ? { prompt: media.prompt } : {}),
  };
}

function useObjectUrl(file: File | undefined): string | undefined {
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

function getMediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith('audio/')) return MediaType.AUDIO;
  if (file.type.startsWith('video/')) return MediaType.VIDEO;
  return MediaType.IMAGE;
}
