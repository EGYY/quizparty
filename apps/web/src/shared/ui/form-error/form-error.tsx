import type { HTMLAttributes } from 'react';
import styles from './form-error.module.scss';

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function FormError({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <small {...props} className={cx(styles.root, className)} role="alert" />;
}
