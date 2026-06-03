import { useEffect, useState, type CSSProperties } from 'react';
import shellStyles from './phone-game-shell.module.scss';
import styles from './starting-countdown.module.scss';

export function StartingCountdown({ startsAt }: { startsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  const [initialMs, setInitialMs] = useState(() => Math.max(1000, startsAt - Date.now()));
  const remainingMs = Math.max(0, startsAt - now);
  const remaining = Math.max(1, Math.ceil(remainingMs / 1000));
  const progress = Math.max(0, Math.min(100, Math.round((remainingMs / initialMs) * 100)));

  useEffect(() => {
    setNow(Date.now());
    setInitialMs(Math.max(1000, startsAt - Date.now()));

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, [startsAt]);

  return (
    <section className={shellStyles['phone-round-screen']}>
      <div
        className={styles['round-countdown-card']}
        role="status"
        aria-live="polite"
        style={{ '--countdown-progress': `${progress}%` } as CSSProperties}
      >
        <span>Старт через</span>
        <div className={styles['round-countdown-ring']} aria-label={`Старт через ${remaining}`}>
          <i />
          <i />
          <i />
          <strong key={remaining}>{remaining}</strong>
        </div>
        <small>{remaining <= 3 ? 'Приготовься!' : 'Вопрос появится на телефоне и TV'}</small>
      </div>
    </section>
  );
}
