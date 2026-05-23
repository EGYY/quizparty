import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { QualityWarning } from '@quizparty/shared';
import { EmptyState } from '@shared/ui';
import styles from './quality-panel.module.scss';

export const QualityPanel = memo(function QualityPanel({
  warnings,
}: {
  warnings: QualityWarning[];
}) {
  if (!warnings.length) {
    return (
      <EmptyState compact>
        <strong>Критичных замечаний нет</strong>
        <span>Можно спокойно продолжать работу с квизами.</span>
      </EmptyState>
    );
  }

  const totalWarnings = warnings.reduce((total, warning) => total + warning.count, 0);

  return (
    <details className={styles.details} open>
      <summary>
        <span>Замечания</span>
        <b>{totalWarnings}</b>
      </summary>
      <div className={styles.warningList}>
        {warnings.map((warning) => (
          <div className={styles.warningRow} key={warning.code}>
            <AlertTriangle size={18} />
            <div>
              <strong>{warning.label}</strong>
              <span>{warning.description ?? 'Проверьте материалы'}</span>
            </div>
            <b>{warning.count}</b>
          </div>
        ))}
      </div>
    </details>
  );
});
