import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import styles from './select.module.scss';

type SelectProps = ComponentProps<'select'> & {
  wrapperClassName?: string;
};

export function Select({ wrapperClassName = '', children, ...props }: SelectProps) {
  return (
    <div className={`${styles.wrapper} ${wrapperClassName}`}>
      <select className={styles.select} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden className={styles.icon} size={14} />
    </div>
  );
}
