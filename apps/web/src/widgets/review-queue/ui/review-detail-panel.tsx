import { Check, ChevronLeft, X } from 'lucide-react';
import type { ReviewQueueItem } from '@quizparty/shared';
import { labels, rejectionReasonOptions, StatusPill } from '@entities/quiz';
import { useReviewDecision } from '@features/review-decision';
import { Button, Eyebrow } from '@shared/ui';
import checklist from '@shared/ui/checklist.module.scss';
import layout from '@shared/ui/layout.module.scss';
import styles from './review-detail-panel.module.scss';

export function ReviewDetailPanel({ item, onBack }: { item: ReviewQueueItem; onBack: () => void }) {
  const decision = useReviewDecision();

  return (
    <>
      <Button className={styles.mobileBack} variant="secondary" onClick={onBack}>
        <ChevronLeft size={17} />К очереди
      </Button>
      <div className={layout.detailHead}>
        <div>
          <Eyebrow>{labels[item.category]}</Eyebrow>
          <h2>{item.title}</h2>
        </div>
        <StatusPill status={item.status} />
      </div>
      <p className={styles.detailDescription}>{item.description}</p>
      <div className={checklist.checklist}>
        {item.validation.map((check) => (
          <div
            className={
              check.passed
                ? `${checklist.checkRow} ${checklist.checkRowPassed}`
                : checklist.checkRow
            }
            key={check.code}
          >
            {check.passed ? <Check size={16} /> : <X size={16} />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.reasonGrid}>
        {rejectionReasonOptions.map((reason) => (
          <label
            key={reason}
            className={`${styles.reasonChip}${
              decision.reasons.includes(reason) ? ` ${styles.activeReasonChip}` : ''
            }`}
          >
            <input
              checked={decision.reasons.includes(reason)}
              onChange={(event) =>
                decision.setReasons((current) =>
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
        className={styles.commentBox}
        placeholder="Комментарий"
        value={decision.comment}
        onChange={(event) => decision.setComment(event.target.value)}
      />
      <div className={`${layout.buttonRow} ${styles.mobileActionRow}`}>
        <Button
          disabled={decision.isPending}
          variant="approve"
          onClick={() => decision.submitDecision({ quizId: item.id, approve: true })}
        >
          <Check size={17} />
          Одобрить
        </Button>
        <Button
          disabled={decision.isPending}
          variant="danger"
          onClick={() => decision.submitDecision({ quizId: item.id, approve: false })}
        >
          <X size={17} />
          Отклонить
        </Button>
      </div>
    </>
  );
}
