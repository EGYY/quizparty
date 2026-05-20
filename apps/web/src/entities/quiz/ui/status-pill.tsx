import { memo } from 'react';
import { QuizStatus } from '@quizparty/shared';
import { labels } from '../config/labels';

export const StatusPill = memo(function StatusPill({ status }: { status: QuizStatus }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{labels[status]}</span>;
});
