import { memo } from 'react';
import { QuizStatus } from '@quizparty/shared';
import { labels } from '../config/labels';
import styles from './status-pill.module.scss';

function statusClass(status: QuizStatus): string {
  switch (status) {
    case QuizStatus.DRAFT:
      return styles.draft ?? '';
    case QuizStatus.PENDING_REVIEW:
      return styles.pendingReview ?? '';
    case QuizStatus.APPROVED:
      return styles.approved ?? '';
    case QuizStatus.REJECTED:
      return styles.rejected ?? '';
  }
}

export const StatusPill = memo(function StatusPill({ status }: { status: QuizStatus }) {
  return <span className={`${styles.pill ?? ''} ${statusClass(status)}`}>{labels[status]}</span>;
});
