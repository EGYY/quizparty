import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizDraftEditor } from '@features/manage-quiz-draft';
import { PageStatus } from '@shared/ui/page-status';
import { QuizEditor } from '@widgets/quiz-editor';

export default function EditorPage() {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();

  const onCreated = useCallback(
    (createdQuizId: string) => {
      void navigate(`/admin/editor/${createdQuizId}`, { replace: true });
    },
    [navigate],
  );

  const onDeleted = useCallback(() => {
    void navigate('/admin/quizzes', { replace: true });
  }, [navigate]);

  const editor = useQuizDraftEditor({ quizId, onCreated, onDeleted });

  if (editor.loadState.status === 'loading') return <PageStatus text="Загрузка редактора" />;
  if (editor.loadState.status === 'error') {
    return (
      <PageStatus
        text="Не удалось открыть черновик"
        tone="error"
        onRetry={editor.loadState.retry}
      />
    );
  }

  return (
    <QuizEditor
      draft={editor.draft}
      canDelete={editor.canDelete}
      isDeleting={editor.isDeleting}
      isSaving={editor.isSaving}
      isSubmitting={editor.isSubmitting}
      pendingCoverFile={editor.pendingMedia.cover}
      pendingQuestionMediaFiles={editor.pendingMedia.questions}
      pendingQuestionRevealMediaFiles={editor.pendingMedia.revealQuestions}
      saveState={editor.saveState}
      onChange={editor.onChange}
      onCoverFileChange={editor.onCoverFileChange}
      onQuestionMediaFileChange={editor.onQuestionMediaFileChange}
      onQuestionRevealMediaFileChange={editor.onQuestionRevealMediaFileChange}
      onQuestionRemoved={editor.onQuestionRemoved}
      onDelete={editor.onDelete}
      onSave={editor.onSave}
      onSubmit={editor.onSubmit}
    />
  );
}
