import { Eye, RotateCcw } from 'lucide-react';

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
    <div className={`page-status ${tone}`}>
      <Eye size={20} />
      <span>{text}</span>
      {onRetry ? (
        <button className="secondary-button compact" type="button" onClick={onRetry}>
          <RotateCcw size={15} />
          Повторить
        </button>
      ) : null}
    </div>
  );
}
