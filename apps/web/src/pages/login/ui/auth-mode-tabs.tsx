import type { AuthMode } from '../model/use-login-page';
import styles from './auth-mode-tabs.module.scss';

export function AuthModeTabs({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  const isRegisterMode = mode === 'register';

  return (
    <div className={styles.authModeTabs} role="tablist" aria-label="Режим авторизации">
      <button
        aria-selected={!isRegisterMode}
        className={!isRegisterMode ? `${styles.tab} ${styles.tabActive}` : styles.tab}
        role="tab"
        type="button"
        onClick={() => onModeChange('login')}
      >
        Вход
      </button>
      <button
        aria-selected={isRegisterMode}
        className={isRegisterMode ? `${styles.tab} ${styles.tabActive}` : styles.tab}
        role="tab"
        type="button"
        onClick={() => onModeChange('register')}
      >
        Регистрация
      </button>
    </div>
  );
}
