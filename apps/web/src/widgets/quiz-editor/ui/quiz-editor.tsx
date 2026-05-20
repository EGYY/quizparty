import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Save, Send, Trash2 } from 'lucide-react';
import type { QuizDraft, QuizDraftQuestion } from '@quizparty/shared';
import { emptyQuestion, localValidation } from '@entities/quiz';
import { computeErrors, EMPTY_ERRORS } from '../lib/compute-errors';
import type { QuestionErrors, QuizEditorProps } from '../model/types';
import { FieldError } from './field-error';
import { MetaPanel } from './meta-panel';
import { QuestionEditorPanel } from './question-editor-panel';
import { QuestionNav } from './question-nav';
import { SaveStateBadge } from './save-state-badge';
import { TVPreviewPanel } from './tv-preview-panel';
import { ValidationPanel } from './validation-panel';
import styles from './quiz-editor.module.scss';

const emptyQuestionErrors: QuestionErrors = { questionText: undefined, options: [] };

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
}: QuizEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const allErrors = useMemo(() => computeErrors(draft), [draft]);
  const validation = useMemo(
    () => (draft.validation.length ? draft.validation : localValidation(draft)),
    [draft],
  );
  const canSubmit = useMemo(() => validation.every((item) => item.passed), [validation]);

  const safeIndex = Math.max(0, Math.min(selectedIndex, draft.questions.length - 1));
  const selectedQuestion = draft.questions[safeIndex];

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
        questions: draft.questions.map((question, questionIndex) =>
          questionIndex === index ? { ...question, ...patch } : question,
        ),
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
          .filter((_, questionIndex) => questionIndex !== index)
          .map((question, order) => ({ ...question, order })),
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
  const selectedQuestionErrors: QuestionErrors = showErrors
    ? (allErrors.questions[safeIndex] ?? emptyQuestionErrors)
    : emptyQuestionErrors;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <input
            className={`${styles.titleInput}${showErrors && allErrors.title ? ` ${styles.titleInputError}` : ''}`}
            placeholder="Название квиза"
            value={draft.title}
            onChange={(e) => setField('title', e.target.value)}
          />
          {showErrors && allErrors.title ? <FieldError message={allErrors.title} /> : null}
          <SaveStateBadge state={saveState} />
        </div>
        <div className={styles.headerActions}>
          {canDelete ? (
            <button
              className="danger-button"
              disabled={isDeleting}
              type="button"
              onClick={onDelete}
            >
              <Trash2 size={15} />
              <span className={styles.btnLabel}>Удалить</span>
            </button>
          ) : null}
          <button
            className="secondary-button"
            disabled={isSaving}
            type="button"
            onClick={handleSave}
          >
            <Save size={15} />
            <span className={styles.btnLabel}>{isSaving ? 'Сохранение…' : 'Сохранить'}</span>
          </button>
          <button
            className="primary-button"
            disabled={!canSubmit || isSubmitting}
            type="button"
            onClick={handleSubmit}
          >
            <Send size={15} />
            <span className={styles.btnLabel}>{isSubmitting ? 'Отправка…' : 'На ревью'}</span>
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
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

        <main className={styles.main}>
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
              onRevealMediaFileChange={(file) =>
                onQuestionRevealMediaFileChange(safeIndex, file)
              }
            />
          ) : (
            <div className={styles.empty}>
              <p>Нет вопросов. Добавьте первый!</p>
              <button className="primary-button" type="button" onClick={addQuestion}>
                <Plus size={16} />
                Добавить вопрос
              </button>
            </div>
          )}
        </main>

        <aside className={styles.side}>
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
