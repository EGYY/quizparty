import { Tv } from 'lucide-react';
import styles from './lobby-tv-card.module.scss';

export function LobbyTvCard() {
  return (
    <section className={styles['lobby-tv-card']}>
      <div className={styles['lobby-tv-icon']}>
        <Tv size={33} />
      </div>
      <div>
        <h2>Ждем старта на TV</h2>
        <p>Когда ведущий начнет игру, вопрос появится здесь!</p>
      </div>
      <div className={styles['lobby-tv-preview']} />
    </section>
  );
}
