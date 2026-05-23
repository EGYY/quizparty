import type { HTMLAttributes } from 'react';
import styles from './eyebrow.module.scss';

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cx(styles.root, className)} />;
}
