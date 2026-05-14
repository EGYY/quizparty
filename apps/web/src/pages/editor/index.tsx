import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuizDraft } from '@quizparty/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { createNewDraft, type SaveState } from '@entities/quiz/model';
import {
  deleteQuiz,
  deleteUploadedMedia,
  getDraft,
  saveDraft,
  submitForReview,
  uploadMediaFile,
} from '@shared/api/admin';
import { useToastStore } from '@shared/ui/toast';
import { PageStatus } from '@shared/ui/page-status';
import { QuizEditor } from '@widgets/quiz-editor';

type PendingMedia = {
  cover: File | undefined;
  questions: Record<number, File>;
  revealQuestions: Record<number, File>;
};

function pickMediaTiming(media: QuizDraft['questions'][number]['media']) {
  return {
    ...(typeof media?.startMs === 'number' ? { startMs: media.startMs } : {}),
    ...(typeof media?.endMs === 'number' ? { endMs: media.endMs } : {}),
    ...(media?.posterUrl ? { posterUrl: media.posterUrl } : {}),
    ...(media?.prompt ? { prompt: media.prompt } : {}),
  };
}

export default function EditorPage() {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useToastStore((state) => state.notify);
  const [draft, setDraft] = useState<QuizDraft>(() => createNewDraft());
  const [pendingMedia, setPendingMedia] = useState<PendingMedia>({
    cover: undefined,
    questions: {},
    revealQuestions: {},
  });
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [isUploading, setIsUploading] = useState(false);

  const draftQuery = useQuery({
    queryKey: ['draft', quizId],
    queryFn: () => getDraft(quizId!),
    enabled: Boolean(quizId),
  });

  const uploadPendingMedia = useCallback(
    async (source: QuizDraft, uploadedUrls: string[]): Promise<QuizDraft> => {
      // Deduplicate uploads: same file (name + size + lastModified) → one request.
      // Handles the case where the same file is picked for both media and revealMedia.
      const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;
      const uploadCache = new Map<string, ReturnType<typeof uploadMediaFile>>();
      const getOrUpload = (file: File, alt: string) => {
        const key = fileKey(file);
        if (!uploadCache.has(key)) uploadCache.set(key, uploadMediaFile(file, alt));
        return uploadCache.get(key)!;
      };

      const questionTasks = [
        ...Object.entries(pendingMedia.questions).map(([index, file]) => ({
          field: 'media' as const,
          index: Number(index),
          file,
          alt: source.questions[Number(index)]?.questionText || file.name,
        })),
        ...Object.entries(pendingMedia.revealQuestions).map(([index, file]) => ({
          field: 'revealMedia' as const,
          index: Number(index),
          file,
          alt: source.questions[Number(index)]?.questionText || file.name,
        })),
      ];

      const [coverUpload, questionUploads] = await Promise.all([
        pendingMedia.cover
          ? getOrUpload(pendingMedia.cover, source.title)
          : Promise.resolve(undefined),
        Promise.all(
          questionTasks.map(async (task) => ({
            field: task.field,
            index: task.index,
            media: (await getOrUpload(task.file, task.alt)).media,
          })),
        ),
      ]);

      // Track unique URLs only — deduplicated uploads share the same URL
      if (coverUpload) uploadedUrls.push(coverUpload.media.url);
      const seenUrls = new Set<string>();
      questionUploads.forEach((item) => {
        if (!seenUrls.has(item.media.url)) {
          seenUrls.add(item.media.url);
          uploadedUrls.push(item.media.url);
        }
      });

      if (!coverUpload && !questionUploads.length) return source;

      const mediaByQuestionIndex = new Map(
        questionUploads
          .filter((item) => item.field === 'media')
          .map((item) => [item.index, item.media]),
      );
      const revealMediaByQuestionIndex = new Map(
        questionUploads
          .filter((item) => item.field === 'revealMedia')
          .map((item) => [item.index, item.media]),
      );

      return {
        ...source,
        ...(coverUpload ? { coverUrl: coverUpload.media.url } : {}),
        questions: source.questions.map((question, index) => {
          const media = mediaByQuestionIndex.get(index);
          const revealMedia = revealMediaByQuestionIndex.get(index);
          return {
            ...question,
            ...(media ? { media: { ...media, ...pickMediaTiming(question.media) } } : {}),
            ...(revealMedia
              ? { revealMedia: { ...revealMedia, ...pickMediaTiming(question.revealMedia) } }
              : {}),
          };
        }),
      };
    },
    [pendingMedia],
  );

  const saveDraftWithMedia = useCallback(
    async (source: QuizDraft) => {
      const uploadedUrls: string[] = [];
      setIsUploading(true);
      let draftWithMedia: QuizDraft;
      try {
        draftWithMedia = await uploadPendingMedia(source, uploadedUrls);
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
    [uploadPendingMedia],
  );

  const saveMutation = useMutation({
    mutationFn: saveDraftWithMedia,
    onMutate: () => setSaveState('saving'),
    onSuccess: (response) => {
      setDraft(response.quiz);
      setPendingMedia({ cover: undefined, questions: {}, revealQuestions: {} });
      setSaveState('saved');
      notify({ tone: 'success', title: 'Квиз сохранен' });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      // Обновляем URL, чтобы повторное сохранение обновляло квиз, а не создавало новый
      if (!quizId && response.quiz.id) {
        void navigate(`/admin/editor/${response.quiz.id}`, { replace: true });
      }
    },
    onError: (error: unknown) => {
      setSaveState('error');
      const message = error instanceof Error ? error.message : 'Попробуйте ещё раз';
      notify({ tone: 'error', title: 'Ошибка сохранения', message });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (source: QuizDraft) => {
      const saved = await saveDraftWithMedia(source);
      if (!saved.quiz.id) throw new Error('Не удалось сохранить квиз перед отправкой');
      return submitForReview(saved.quiz.id);
    },
    onSuccess: (saved) => {
      setDraft(saved);
      setPendingMedia({ cover: undefined, questions: {}, revealQuestions: {} });
      notify({ tone: 'success', title: 'Квиз отправлен на ревью' });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['review'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      notify({ tone: 'success', title: 'Квиз удален' });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['review'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      void navigate('/admin/quizzes', { replace: true });
    },
    onError: () =>
      notify({
        tone: 'error',
        title: 'Не удалось удалить квиз',
        message: 'Попробуйте еще раз.',
      }),
  });

  useEffect(() => {
    if (draftQuery.data) {
      setDraft(draftQuery.data);
      setPendingMedia({ cover: undefined, questions: {}, revealQuestions: {} });
      setSaveState('saved');
    }
    if (!quizId) {
      setDraft(createNewDraft());
      setPendingMedia({ cover: undefined, questions: {}, revealQuestions: {} });
      setSaveState('idle');
    }
  }, [quizId, draftQuery.data]);

  const onChange = useCallback((nextDraft: QuizDraft) => {
    setDraft(nextDraft);
    setSaveState('dirty');
  }, []);

  const onSave = useCallback(() => saveMutation.mutate(draft), [draft, saveMutation]);
  const onSubmit = useCallback(() => submitMutation.mutate(draft), [draft, submitMutation]);
  const onDelete = useCallback(() => {
    if (!draft.id) return;
    if (!window.confirm('Удалить квиз и неиспользуемые файлы с сервера?')) return;
    deleteMutation.mutate(draft.id);
  }, [deleteMutation, draft.id]);

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
    setPendingMedia((current) => {
      const nextQuestions: Record<number, File> = {};
      const nextRevealQuestions: Record<number, File> = {};
      Object.entries(current.questions).forEach(([key, file]) => {
        const currentIndex = Number(key);
        if (currentIndex < index) nextQuestions[currentIndex] = file;
        if (currentIndex > index) nextQuestions[currentIndex - 1] = file;
      });
      Object.entries(current.revealQuestions).forEach(([key, file]) => {
        const currentIndex = Number(key);
        if (currentIndex < index) nextRevealQuestions[currentIndex] = file;
        if (currentIndex > index) nextRevealQuestions[currentIndex - 1] = file;
      });
      return { ...current, questions: nextQuestions, revealQuestions: nextRevealQuestions };
    });
  }, []);

  if (draftQuery.isLoading) return <PageStatus text="Загрузка редактора" />;
  if (draftQuery.isError) {
    return (
      <PageStatus
        text="Не удалось открыть черновик"
        tone="error"
        onRetry={() => void draftQuery.refetch()}
      />
    );
  }

  return (
    <QuizEditor
      draft={draft}
      canDelete={Boolean(draft.id)}
      isDeleting={deleteMutation.isPending}
      isSaving={saveMutation.isPending || isUploading}
      isSubmitting={submitMutation.isPending || isUploading}
      pendingCoverFile={pendingMedia.cover}
      pendingQuestionMediaFiles={pendingMedia.questions}
      pendingQuestionRevealMediaFiles={pendingMedia.revealQuestions}
      saveState={saveState}
      onChange={onChange}
      onCoverFileChange={onCoverFileChange}
      onQuestionMediaFileChange={onQuestionMediaFileChange}
      onQuestionRevealMediaFileChange={onQuestionRevealMediaFileChange}
      onQuestionRemoved={onQuestionRemoved}
      onDelete={onDelete}
      onSave={onSave}
      onSubmit={onSubmit}
    />
  );
}
