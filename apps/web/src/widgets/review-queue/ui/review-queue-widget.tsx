import { useEffect, useState } from 'react';
import { Eyebrow, PageStatus } from '@shared/ui';
import layout from '@shared/ui/layout.module.scss';
import { useReviewFilterState } from '../model/use-review-filter-state';
import { useReviewQueue } from '../model/use-review-queue';
import { ReviewDetailPanel } from './review-detail-panel';
import { ReviewFilters } from './review-filters';
import { ReviewList } from './review-list';
import styles from './review-queue.module.scss';

export function ReviewQueueWidget() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const reviewFilters = useReviewFilterState();
  const { review, selected, selectItem } = useReviewQueue(reviewFilters.filters);

  useEffect(() => {
    setIsDetailOpen(false);
  }, [reviewFilters.filters]);

  const handleSelect = (id: string) => {
    selectItem(id);
    setIsDetailOpen(true);
  };

  return (
    <section className={`${styles.layout}${isDetailOpen ? ` ${styles.detailOpen}` : ''}`}>
      <div className={`${layout.panel} ${styles.list}`}>
        <div className={layout.panelHeader}>
          <div>
            <Eyebrow>Review Queue</Eyebrow>
            <h3>Модерация</h3>
          </div>
          <strong className={styles.queueCount}>{review.data?.total ?? 0}</strong>
        </div>
        <ReviewFilters
          activeFilterCount={reviewFilters.activeFilterCount}
          areFiltersOpen={reviewFilters.areFiltersOpen}
          filters={reviewFilters.filters}
          filtersId={reviewFilters.filtersId}
          onFiltersChange={reviewFilters.updateFilters}
          onToggleFilters={reviewFilters.toggleFilters}
        />

        {review.isLoading ? <PageStatus text="Загрузка очереди" /> : null}
        {review.isError ? (
          <PageStatus
            text="Не удалось загрузить очередь"
            tone="error"
            onRetry={() => void review.refetch()}
          />
        ) : null}
        {!review.isLoading && !review.isError && review.data ? (
          <ReviewList items={review.data.items} selectedId={selected?.id} onSelect={handleSelect} />
        ) : null}
      </div>

      <aside className={`${layout.panel} ${styles.detail} ${styles.detailFade}`}>
        {selected ? (
          <ReviewDetailPanel
            key={selected.id}
            item={selected}
            onBack={() => setIsDetailOpen(false)}
          />
        ) : (
          <PageStatus text="Очередь пуста" />
        )}
      </aside>
    </section>
  );
}
