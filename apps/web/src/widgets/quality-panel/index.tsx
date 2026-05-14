import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { QualityWarning } from '@quizparty/shared';

export const QualityPanel = memo(function QualityPanel({
  warnings,
}: {
  warnings: QualityWarning[];
}) {
  return (
    <div className="warning-list">
      {warnings.map((warning) => (
        <div className="warning-row" key={warning.code}>
          <AlertTriangle size={18} />
          <div>
            <strong>{warning.label}</strong>
            <span>{warning.description ?? 'Проверьте материалы'}</span>
          </div>
          <b>{warning.count}</b>
        </div>
      ))}
    </div>
  );
});
