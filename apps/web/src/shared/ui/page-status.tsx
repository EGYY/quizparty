import { Eye, RotateCcw } from 'lucide-react';
import { Button } from './button/button';
import styles from './page-status.module.scss';

export function PageStatus({
  text,
  tone = 'muted',
  onRetry,
}: {
  text: string;
  tone?: 'muted' | 'error';
  onRetry?: () => void;
}) {
  return (
    <div className={`${styles.root}${tone === 'error' ? ` ${styles.error}` : ''}`}>
      <Eye size={20} />
      <span>{text}</span>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          <RotateCcw size={15} />
          Повторить
        </Button>
      ) : null}
    </div>
  );
}
