import type { ReactNode } from 'react';
import { Eyebrow } from '../eyebrow/eyebrow';
import styles from './brand-lockup.module.scss';

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BrandLockup({
  className,
  eyebrow,
  logoSrc,
  markSize = 'md',
  title,
}: {
  className?: string;
  eyebrow: ReactNode;
  logoSrc: string;
  markSize?: 'md' | 'lg';
  title: ReactNode;
}) {
  return (
    <div className={cx(styles.root, className)}>
      <img alt="" className={cx(styles.mark, markSize === 'lg' && styles.large)} src={logoSrc} />
      <div className={styles.content}>
        <Eyebrow>{eyebrow}</Eyebrow>
        {typeof title === 'string' ? <strong>{title}</strong> : title}
      </div>
    </div>
  );
}
