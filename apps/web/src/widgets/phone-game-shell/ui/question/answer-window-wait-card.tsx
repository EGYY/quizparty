import { Clock3 } from 'lucide-react';
import styles from './answer-window-wait-card.module.scss';

export function AnswerWindowWaitCard({ remainingSeconds }: { remainingSeconds: number }) {
  return (
    <div className={styles['answer-window-wait-card']}>
      <Clock3 size={34} />
      <strong>Готовься отвечать</strong>
      <span>Варианты появятся через {remainingSeconds} с</span>
      <small>Сначала читаем вопрос, потом выбираем на скорость</small>
    </div>
  );
}
