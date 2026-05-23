import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuizDraft } from '@quizparty/shared';
import { deleteUploadedMedia } from '@entities/media';
import { createNewDraft, type SaveState } from '@entities/quiz';
import { queryKeys } from '@shared/api';
import { useToastStore } from '@shared/ui';
import { deleteQuiz, getDraft, saveDraft, submitForReview } from '../api/quiz-draft';
import { emptyPendingMedia, shiftPendingMediaAfterQuestionRemoved } from '../lib/pending-media';
import { uploadPendingMedia } from '../lib/upload-pending-media';
import type { EditorLoadState, PendingMedia } from './types';

type UseQuizDraftEditorParams = {
  quizId: string | undefined;
  onCreated: (quizId: string) => void;
  onDeleted: () => void;
};

export function useQuizDraftEditor({ quizId, onCreated, onDeleted }: UseQuizDraftEditorParams) {
  const queryClient = useQueryClient();
  const notify = useToastStore((state) => state.notify);
  const [draft, setDraft] = useState<QuizDraft>(() => createNewDraft());
  const [pendingMedia, setPendingMedia] = useState<PendingMedia>(() => emptyPendingMedia());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [isUploading, setIsUploading] = useState(false);

  const draftQuery = useQuery({
    queryKey: queryKeys.draft(quizId),
    queryFn: ({ signal }) => getDraft(quizId!, signal),
    enabled: Boolean(quizId),
  });

  const saveDraftWithMedia = useCallback(
    async (source: QuizDraft) => {
      setIsUploading(true);
      let uploadedUrls: string[] = [];
      let draftWithMedia: QuizDraft;
      try {
        const uploadResult = await uploadPendingMedia(source, pendingMedia);
        uploadedUrls = uploadResult.uploadedUrls;
        draftWithMedia = uploadResult.draft;
      } finally {
        setIsUploading(false);
      }

      try {
        return await saveDraft(draftWithMedia);
      } catch (error) {
        await Promise.all(
          uploadedUrls.map((url) => deleteUploadedMedia(url).catch(() => undefined)),
        );
        throw error;
      }
    },
    [pendingMedia],
  );

  const { isPending: isSavePending, mutate: saveDraftMutate } = useMutation({
    mutationFn: saveDraftWithMedia,
    onMutate: () => setSaveState('saving'),
    onSuccess: (response) => {
      setDraft(response.quiz);
      setPendingMedia(emptyPendingMedia());
      setSaveState('saved');
      notify({ tone: 'success', title: 'Квиз сохранен' });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminQuizzes() });
      if (!quizId && response.quiz.id) onCreated(response.quiz.id);
    },
    onError: (error: unknown) => {
      setSaveState('error');
      const message = error instanceof Error ? error.message : 'Попробуйте ещё раз';
      notify({ tone: 'error', title: 'Ошибка сохранения', message });
    },
  });

  const { isPending: isSubmitPending, mutate: submitDraftMutate } = useMutation({
    mutationFn: async (source: QuizDraft) => {
      const saved = await saveDraftWithMedia(source);
      if (!saved.quiz.id) throw new Error('Не удалось сохранить квиз перед отправкой');
      return submitForReview(saved.quiz.id);
    },
    onSuccess: (saved) => {
      setDraft(saved);
      setPendingMedia(emptyPendingMedia());
      notify({ tone: 'success', title: 'Квиз отправлен на ревью' });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.review() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminQuizzes() });
    },
  });

  const { isPending: isDeletePending, mutate: deleteQuizMutate } = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      notify({ tone: 'success', title: 'Квиз удален' });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.review() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminQuizzes() });
      onDeleted();
    },
    onError: () =>
      notify({
        tone: 'error',
        title: 'Не удалось удалить квиз',
        message: 'Попробуйте еще раз.',
      }),
  });

  const appliedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = quizId ?? '__new__';
    if (appliedKeyRef.current === key) return;

    if (!quizId) {
      setDraft(createNewDraft());
      setPendingMedia(emptyPendingMedia());
      setSaveState('idle');
      appliedKeyRef.current = key;
      return;
    }
    if (draftQuery.data && draftQuery.data.id === quizId) {
      setDraft(draftQuery.data);
      setPendingMedia(emptyPendingMedia());
      setSaveState('saved');
      appliedKeyRef.current = key;
    }
  }, [quizId, draftQuery.data]);

  const onChange = useCallback((nextDraft: QuizDraft) => {
    setDraft(nextDraft);
    setSaveState('dirty');
  }, []);

  const onSave = useCallback(() => saveDraftMutate(draft), [draft, saveDraftMutate]);
  const onSubmit = useCallback(() => submitDraftMutate(draft), [draft, submitDraftMutate]);
  const onDelete = useCallback(() => {
    if (!draft.id) return;
    deleteQuizMutate(draft.id);
  }, [deleteQuizMutate, draft.id]);

  const onCoverFileChange = useCallback((file: File | undefined) => {
    setPendingMedia((current) => ({ ...current, cover: file }));
  }, []);

  const onQuestionMediaFileChange = useCallback((index: number, file: File | undefined) => {
    setPendingMedia((current) => {
      const nextQuestions = { ...current.questions };
      if (file) nextQuestions[index] = file;
      else delete nextQuestions[index];
      return { ...current, questions: nextQuestions };
    });
  }, []);

  const onQuestionRevealMediaFileChange = useCallback((index: number, file: File | undefined) => {
    setPendingMedia((current) => {
      const nextQuestions = { ...current.revealQuestions };
      if (file) nextQuestions[index] = file;
      else delete nextQuestions[index];
      return { ...current, revealQuestions: nextQuestions };
    });
  }, []);

  const onQuestionRemoved = useCallback((index: number) => {
    setPendingMedia((current) => shiftPendingMediaAfterQuestionRemoved(current, index));
  }, []);

  const loadState: EditorLoadState = draftQuery.isLoading
    ? { status: 'loading' }
    : draftQuery.isError
      ? { status: 'error', retry: () => void draftQuery.refetch() }
      : { status: 'ready' };

  return {
    draft,
    loadState,
    pendingMedia,
    saveState,
    canDelete: Boolean(draft.id),
    isDeleting: isDeletePending,
    isSaving: isSavePending || isUploading,
    isSubmitting: isSubmitPending || isUploading,
    onChange,
    onCoverFileChange,
    onDelete,
    onQuestionMediaFileChange,
    onQuestionRemoved,
    onQuestionRevealMediaFileChange,
    onSave,
    onSubmit,
  };
}
