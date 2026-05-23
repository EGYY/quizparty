import { ChevronRight } from 'lucide-react';
import type { ReviewQueueItem } from '@quizparty/shared';
import { labels } from '@entities/quiz';
import { resolveAssetUrl } from '@shared/lib';
import styles from './review-list.module.scss';

export function ReviewListItem({
  item,
  isActive,
  onSelect,
}: {
  isActive: boolean;
  item: ReviewQueueItem;
  onSelect: (id: string) => void;
}) {
  const cover = resolveAssetUrl(item.coverUrl);

  return (
    <button
      className={`${styles.item}${isActive ? ` ${styles.activeItem}` : ''}`}
      type="button"
      onClick={() => onSelect(item.id)}
    >
      <div className={styles.thumb}>{cover ? <img alt="" loading="lazy" src={cover} /> : null}</div>
      <div>
        <strong>{item.title}</strong>
        <span>{item.author.displayName}</span>
        <small>
          {labels[item.category]} · {item.questionCount} вопросов
        </small>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}
