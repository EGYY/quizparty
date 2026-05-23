import type { ReactNode } from 'react';
import { Eyebrow } from '../eyebrow/eyebrow';
import styles from './fallback-screen.module.scss';

export function FallbackScreen({
  action,
  eyebrow = 'QuizParty',
  message,
  title,
}: {
  action?: ReactNode;
  eyebrow?: ReactNode;
  message: ReactNode;
  title: ReactNode;
}) {
  return (
    <main className={styles.root}>
      <section className={styles.panel}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p className={styles.message}>{message}</p>
        {action}
      </section>
    </main>
  );
}
