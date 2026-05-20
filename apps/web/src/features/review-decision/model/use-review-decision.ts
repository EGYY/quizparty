import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewRejectionReason } from '@quizparty/shared';
import { queryKeys } from '@shared/api/query-keys';
import { useToastStore } from '@shared/ui/toast';
import { reviewQuiz } from '../api/review-decision';

export function useReviewDecision() {
  const queryClient = useQueryClient();
  const notify = useToastStore((state) => state.notify);
  const [reasons, setReasons] = useState<ReviewRejectionReason[]>([]);
  const [comment, setComment] = useState('');

  const { isPending, mutate } = useMutation({
    mutationFn: ({ quizId, approve }: { quizId: string; approve: boolean }) =>
      reviewQuiz(quizId, {
        approve,
        reasons: approve ? [] : reasons,
        comment: approve ? undefined : comment,
      }),
    onSuccess: (_, variables) => {
      setReasons([]);
      setComment('');
      notify({ tone: 'success', title: variables.approve ? 'Квиз одобрен' : 'Квиз отклонен' });
      void queryClient.invalidateQueries({ queryKey: queryKeys.review() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminQuizzes() });
    },
  });

  return {
    comment,
    isPending,
    reasons,
    setComment,
    setReasons,
    submitDecision: mutate,
  };
}
