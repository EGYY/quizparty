import styles from './lobby-connection-status.module.scss';

export function LobbyConnectionStatus({ connectionStatus }: { connectionStatus: string }) {
  return (
    <span
      className={`${styles['phone-lobby-connection']} ${styles[connectionStatus] ?? ''}`}
      role="status"
      aria-live="polite"
    >
      {connectionStatus}
    </span>
  );
}
