import { memo, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { QuizDraft, QuizDraftQuestion } from '@quizparty/shared';
import { emptyQuestion, localValidation } from '@entities/quiz';
import { Button } from '@shared/ui';
import { computeErrors, EMPTY_ERRORS } from '../lib/compute-errors';
import { useQuizEditorView } from '../model/use-quiz-editor-view';
import type { MobileEditorView, QuestionErrors, QuizEditorProps } from '../model/types';
import { EditorHeaderBar } from './layout/editor-header-bar';
import { EditorMobileTabs } from './layout/editor-mobile-tabs';
import { EditorSidebar } from './layout/editor-sidebar';
import { QuestionEditorPanel } from './question/question-editor-panel';
import { TVPreviewPanel } from './preview/tv-preview-panel';
import { ValidationPanel } from './validation/validation-panel';
import styles from './quiz-editor.module.scss';

const emptyQuestionErrors: QuestionErrors = { questionText: undefined, options: [] };

export const QuizEditor = memo(function QuizEditor({
  draft,
  canDelete,
  canEditStatus,
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
  const allErrors = useMemo(() => computeErrors(draft), [draft]);
  const validation = useMemo(
    () => (draft.validation.length ? draft.validation : localValidation(draft)),
    [draft],
  );
  const canSubmit = useMemo(() => validation.every((item) => item.passed), [validation]);
  const failedValidationCount = validation.filter((item) => !item.passed).length;
  const {
    isDeleteOpen,
    mobileTabs,
    mobileView,
    safeIndex,
    setIsDeleteOpen,
    setMobileView,
    setSelectedIndex,
    setShowErrors,
    showErrors,
  } = useQuizEditorView({
    draftId: draft.id,
    failedValidationCount,
    questionCount: draft.questions.length,
  });

  const selectedQuestion = draft.questions[safeIndex];

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
    setMobileView('check');
    onSubmit();
  }, [onSubmit]);

  const visibleErrors = showErrors ? allErrors : EMPTY_ERRORS;
  const selectedQuestionErrors: QuestionErrors = showErrors
    ? (allErrors.questions[safeIndex] ?? emptyQuestionErrors)
    : emptyQuestionErrors;
  const mobileSectionClass = (view: MobileEditorView, extraClass?: string) =>
    [styles.mobileSection, mobileView === view ? styles.mobileSectionActive : '', extraClass ?? '']
      .filter(Boolean)
      .join(' ');

  return (
    <div className={styles.root}>
      <EditorHeaderBar
        canDelete={canDelete}
        canSubmit={canSubmit}
        isDeleteOpen={isDeleteOpen}
        isDeleting={isDeleting}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        saveState={saveState}
        showErrors={showErrors}
        title={draft.title}
        titleError={allErrors.title}
        onDelete={onDelete}
        onSave={handleSave}
        onSubmit={handleSubmit}
        onTitleChange={(value) => setField('title', value)}
        onToggleDelete={() => setIsDeleteOpen((value) => !value)}
      />

      <EditorMobileTabs activeView={mobileView} tabs={mobileTabs} onSelect={setMobileView} />

      <div className={styles.body}>
        <EditorSidebar
          allErrors={allErrors}
          canEditStatus={canEditStatus}
          draft={draft}
          errors={visibleErrors}
          mobileSectionClass={mobileSectionClass}
          pendingCoverFile={pendingCoverFile}
          safeIndex={safeIndex}
          showErrors={showErrors}
          setField={setField}
          onAdd={addQuestion}
          onCoverFileChange={onCoverFileChange}
          onSelect={(index) => {
            setSelectedIndex(index);
            setMobileView('question');
          }}
        />

        <main className={styles.main}>
          <div className={mobileSectionClass('check', styles.mobileValidation)}>
            <ValidationPanel validation={validation} />
          </div>

          <div className={mobileSectionClass('preview', styles.mobilePreview)}>
            <TVPreviewPanel
              draft={draft}
              pendingCoverFile={pendingCoverFile}
              question={selectedQuestion}
            />
          </div>

          <div className={mobileSectionClass('question', styles.questionEditorSlot)}>
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
              <div className={styles.empty}>
                <p>Нет вопросов. Добавьте первый!</p>
                <Button variant="primary" onClick={addQuestion}>
                  <Plus size={16} />
                  Добавить вопрос
                </Button>
              </div>
            )}
          </div>
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
