import { SlidersHorizontal } from 'lucide-react';
import { QuizCategory, QuizStatus } from '@quizparty/shared';
import type { ReviewQueueFilters } from '@quizparty/shared';
import { categoryOptions, labels, statusOptions } from '@entities/quiz';
import { Button, SearchField, Select } from '@shared/ui';
import styles from './review-filters.module.scss';

export function ReviewFilters({
  activeFilterCount,
  areFiltersOpen,
  filters,
  filtersId,
  onFiltersChange,
  onToggleFilters,
}: {
  activeFilterCount: number;
  areFiltersOpen: boolean;
  filters: ReviewQueueFilters;
  filtersId: string;
  onFiltersChange: (patch: Partial<ReviewQueueFilters>) => void;
  onToggleFilters: () => void;
}) {
  return (
    <div className={styles.filterShell}>
      <div className={styles.filterPrimary}>
        <SearchField
          inline
          label="Найти квиз в очереди"
          placeholder="Найти"
          value={filters.search ?? ''}
          onChange={(event) => onFiltersChange({ search: event.target.value || undefined })}
        />
        <Button
          aria-controls={filtersId}
          aria-expanded={areFiltersOpen}
          className={styles.filterToggle}
          variant="secondary"
          onClick={onToggleFilters}
        >
          <SlidersHorizontal size={17} />
          Фильтры
          {activeFilterCount ? <span>{activeFilterCount}</span> : null}
        </Button>
      </div>

      <div
        className={`${styles.filters}${areFiltersOpen ? ` ${styles.filtersOpen}` : ''}`}
        id={filtersId}
      >
        <Select
          aria-label="Статус"
          value={filters.status ?? QuizStatus.PENDING_REVIEW}
          onChange={(event) => onFiltersChange({ status: event.target.value as QuizStatus })}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {labels[status]}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Категория"
          value={filters.category ?? QuizCategory.ALL}
          onChange={(event) => onFiltersChange({ category: event.target.value as QuizCategory })}
        >
          <option value={QuizCategory.ALL}>Все категории</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {labels[category]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
