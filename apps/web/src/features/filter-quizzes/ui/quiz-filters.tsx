import { Search } from 'lucide-react';
import { AdminSort, QuizCategory } from '@quizparty/shared';
import { categoryOptions, labels, sortOptions, statusOptions } from '@entities/quiz';

export function QuizFilters({
  category,
  search,
  sort,
  status,
  setCategory,
  setSearch,
  setSort,
  setStatus,
}: {
  category: QuizCategory;
  search: string;
  sort: AdminSort;
  status: string;
  setCategory: (category: QuizCategory) => void;
  setSearch: (search: string) => void;
  setSort: (sort: AdminSort) => void;
  setStatus: (status: string) => void;
}) {
  return (
    <div className="filter-row">
      <label className="search-box inline">
        <Search size={18} />
        <input
          value={search}
          placeholder="Название или описание"
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <select value={category} onChange={(event) => setCategory(event.target.value as QuizCategory)}>
        <option value={QuizCategory.ALL}>Все категории</option>
        {categoryOptions.map((item) => (
          <option key={item} value={item}>
            {labels[item]}
          </option>
        ))}
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">Все статусы</option>
        {statusOptions.map((item) => (
          <option key={item} value={item}>
            {labels[item]}
          </option>
        ))}
      </select>
      <select value={sort} onChange={(event) => setSort(event.target.value as AdminSort)}>
        {sortOptions.map((item) => (
          <option key={item} value={item}>
            {labels[item]}
          </option>
        ))}
      </select>
    </div>
  );
}
