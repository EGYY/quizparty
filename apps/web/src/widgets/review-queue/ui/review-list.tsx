import type { ReviewQueueItem } from '@quizparty/shared';
import { EmptyState } from '@shared/ui';
import { ReviewListItem } from './review-list-item';

export function ReviewList({
  items,
  selectedId,
  onSelect,
}: {
  items: ReviewQueueItem[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (!items.length) {
    return (
      <EmptyState compact>
        <strong>Очередь пуста</strong>
        <span>Квизы для модерации появятся здесь после отправки на ревью.</span>
      </EmptyState>
    );
  }

  return items.map((item) => (
    <ReviewListItem
      isActive={selectedId === item.id}
      item={item}
      key={item.id}
      onSelect={onSelect}
    />
  ));
}
