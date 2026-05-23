import type { ReactNode } from 'react';
import styles from './empty-state.module.scss';

export function EmptyState({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className={compact ? `${styles.root} ${styles.compact}` : styles.root}>{children}</div>
  );
}
