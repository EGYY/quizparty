import { useId, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { AdminSort, QuizCategory } from '@quizparty/shared';
import { categoryOptions, labels, sortOptions, statusOptions } from '@entities/quiz';
import { Button, SearchField, Select } from '@shared/ui';
import styles from './quiz-filters.module.scss';

export function QuizFilters({
  category,
  search,
  sort,
  status,
  setCategory,
  setSearch,
  setSort,
  setStatus,
  activeFilterCount,
  onReset,
}: {
  activeFilterCount: number;
  category: QuizCategory;
  search: string;
  sort: AdminSort;
  status: string;
  onReset: () => void;
  setCategory: (category: QuizCategory) => void;
  setSearch: (search: string) => void;
  setSort: (sort: AdminSort) => void;
  setStatus: (status: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const chips = [
    category !== QuizCategory.ALL ? labels[category] : undefined,
    status ? labels[status] : undefined,
    sort !== AdminSort.NEWEST ? labels[sort] : undefined,
  ].filter((chip): chip is string => Boolean(chip));

  return (
    <div className={styles.filterShell}>
      <div className={styles.filterPrimaryRow}>
        <SearchField
          inline
          label="Поиск по названию или описанию"
          placeholder="Название или описание"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className={styles.filterToggle}
          variant="secondary"
          onClick={() => setIsOpen((current) => !current)}
        >
          <SlidersHorizontal size={17} />
          Фильтры
          {activeFilterCount > 0 ? <span>{activeFilterCount}</span> : null}
        </Button>
      </div>

      {chips.length > 0 || search.trim() ? (
        <div className={styles.filterChips} aria-label="Активные фильтры">
          {search.trim() ? <span className={styles.filterChip}>Поиск: {search.trim()}</span> : null}
          {chips.map((chip) => (
            <span className={styles.filterChip} key={chip}>
              {chip}
            </span>
          ))}
          <button
            className={`${styles.filterChip ?? ''} ${styles.filterChipReset ?? ''}`}
            type="button"
            onClick={onReset}
          >
            <X size={14} />
            Сбросить
          </button>
        </div>
      ) : null}

      <div
        className={`${styles.filterRow ?? ''} ${styles.filterPanel ?? ''} ${isOpen ? (styles.filterPanelOpen ?? '') : ''}`}
        id={panelId}
      >
        <Select
          aria-label="Категория"
          value={category}
          onChange={(event) => setCategory(event.target.value as QuizCategory)}
        >
          <option value={QuizCategory.ALL}>Все категории</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>
              {labels[item]}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Статус"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Все статусы</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {labels[item]}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Сортировка"
          value={sort}
          onChange={(event) => setSort(event.target.value as AdminSort)}
        >
          {sortOptions.map((item) => (
            <option key={item} value={item}>
              {labels[item]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
