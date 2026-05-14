import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Search, X } from 'lucide-react';
import { AdminSort, QuizCategory, QuizStatus, ReviewRejectionReason } from '@quizparty/shared';
import type { ReviewQueueFilters } from '@quizparty/shared';
import { getReviewQueue, reviewQuiz } from '@shared/api/admin';
import {
  categoryOptions,
  labels,
  rejectionReasonOptions,
  statusOptions,
} from '@shared/config/labels';
import { resolveAssetUrl } from '@shared/lib/assets';
import { PageStatus } from '@shared/ui/page-status';
import { StatusPill } from '@shared/ui/status-pill';
import { useToastStore } from '@shared/ui/toast';

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const notify = useToastStore((state) => state.notify);
  const [filters, setFilters] = useState<ReviewQueueFilters>({
    status: QuizStatus.PENDING_REVIEW,
    category: QuizCategory.ALL,
    tags: [],
    sort: AdminSort.NEWEST,
  });
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [reasons, setReasons] = useState<ReviewRejectionReason[]>([]);
  const [comment, setComment] = useState('');

  const review = useQuery({
    queryKey: ['review', filters],
    queryFn: () => getReviewQueue(filters),
  });

  const decisionMutation = useMutation({
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
      void queryClient.invalidateQueries({ queryKey: ['review'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
  });

  const selected = useMemo(
    () =>
      review.data?.items.find((item) => item.id === selectedId) ??
      review.data?.selectedQuiz ??
      review.data?.items[0],
    [review.data, selectedId],
  );

  return (
    <section className="review-layout">
      <div className="panel review-list">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Review Queue</p>
            <h3>Модерация</h3>
          </div>
          <strong className="queue-count">{review.data?.total ?? 0}</strong>
        </div>
        <div className="review-filters">
          <label className="search-box inline">
            <Search size={18} />
            <input
              placeholder="Найти"
              value={filters.search ?? ''}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value || undefined }))
              }
            />
          </label>
          <select
            value={filters.status ?? QuizStatus.PENDING_REVIEW}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value as QuizStatus }))
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {labels[status]}
              </option>
            ))}
          </select>
          <select
            value={filters.category ?? QuizCategory.ALL}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value as QuizCategory,
              }))
            }
          >
            <option value={QuizCategory.ALL}>Все категории</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {labels[category]}
              </option>
            ))}
          </select>
        </div>

        {review.isLoading ? <PageStatus text="Загрузка очереди" /> : null}
        {review.isError ? (
          <PageStatus
            text="Не удалось загрузить очередь"
            tone="error"
            onRetry={() => void review.refetch()}
          />
        ) : null}
        {review.data?.items.map((item) => {
          const cover = resolveAssetUrl(item.coverUrl);

          return (
            <button
              className={selected?.id === item.id ? 'review-item active' : 'review-item'}
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
            >
              <div className="review-thumb">
                {cover ? <img alt="" loading="lazy" src={cover} /> : null}
              </div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.author.displayName}</span>
                <small>
                  {labels[item.category]} · {item.questionCount} вопросов
                </small>
              </div>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>

      <motion.aside
        className="panel review-detail"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {selected ? (
          <>
            <div className="detail-head">
              <div>
                <p className="eyebrow">{labels[selected.category]}</p>
                <h2>{selected.title}</h2>
              </div>
              <StatusPill status={selected.status} />
            </div>
            <p className="detail-description">{selected.description}</p>
            <div className="checklist">
              {selected.validation.map((item) => (
                <div className={item.passed ? 'check-row passed' : 'check-row'} key={item.code}>
                  {item.passed ? <Check size={16} /> : <X size={16} />}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="reason-grid">
              {rejectionReasonOptions.map((reason) => (
                <label
                  key={reason}
                  className={reasons.includes(reason) ? 'reason-chip active' : 'reason-chip'}
                >
                  <input
                    checked={reasons.includes(reason)}
                    onChange={(event) =>
                      setReasons((current) =>
                        event.target.checked
                          ? [...current, reason]
                          : current.filter((candidate) => candidate !== reason),
                      )
                    }
                    type="checkbox"
                  />
                  {labels[reason]}
                </label>
              ))}
            </div>
            <textarea
              className="comment-box"
              placeholder="Комментарий"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <div className="button-row">
              <button
                className="approve-button"
                type="button"
                disabled={decisionMutation.isPending}
                onClick={() => decisionMutation.mutate({ quizId: selected.id, approve: true })}
              >
                <Check size={17} />
                Одобрить
              </button>
              <button
                className="danger-button"
                type="button"
                disabled={decisionMutation.isPending}
                onClick={() => decisionMutation.mutate({ quizId: selected.id, approve: false })}
              >
                <X size={17} />
                Отклонить
              </button>
            </div>
          </>
        ) : (
          <PageStatus text="Очередь пуста" />
        )}
      </motion.aside>
    </section>
  );
}
