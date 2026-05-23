import styles from './pause-overlay.module.scss';

export function PauseOverlay() {
  return (
    <div className={styles['pause-overlay']} role="status" aria-live="polite">
      <div className={styles['pause-overlay-card']}>
        <span>Ведущий поставил игру на паузу</span>
        <strong>Пауза</strong>
        <small>Оставайтесь на месте, игра скоро продолжится.</small>
      </div>
    </div>
  );
}
