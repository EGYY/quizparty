import type { ReactNode } from 'react';
import { logoMarkUrl } from '@shared/lib';
import { BrandLockup } from '@shared/ui';
import styles from './auth-shell.module.scss';

export function AuthShell({
  children,
  isRegisterMode,
}: {
  children: ReactNode;
  isRegisterMode: boolean;
}) {
  return (
    <main className={styles.loginScreen}>
      <section className={styles.loginPanel} aria-label="Вход в панель автора">
        <BrandLockup
          eyebrow="QuizParty"
          logoSrc={logoMarkUrl}
          markSize="lg"
          title={<h1>{isRegisterMode ? 'Стать автором' : 'Панель автора'}</h1>}
        />
        {children}
      </section>
    </main>
  );
}
