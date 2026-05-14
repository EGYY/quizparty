import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminSort, QuizCategory } from '@quizparty/shared';
import type { AdminQuizListFilters } from '@quizparty/shared';
import { listAdminQuizzes } from '@shared/api/admin';
import { categoryOptions, labels, sortOptions, statusOptions } from '@shared/config/labels';
import { PageStatus } from '@shared/ui/page-status';
import { QuizTable } from '@widgets/quiz-table';

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.ALL);
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<AdminSort>(AdminSort.NEWEST);

  const filters = useMemo<AdminQuizListFilters>(
    () => ({
      category,
      sort,
      tags: [],
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status ? { status: status as AdminQuizListFilters['status'] } : {}),
    }),
    [category, search, sort, status],
  );

  const quizzes = useQuery({
    queryKey: ['admin-quizzes', filters],
    queryFn: () => listAdminQuizzes(filters),
  });

  const openEditor = useCallback(
    (quizId?: string) => {
      void navigate(quizId ? `/admin/editor/${quizId}` : '/admin/editor');
    },
    [navigate],
  );

  return (
    <section className="panel full-panel">
      <div className="panel-header filters-header">
        <div>
          <p className="eyebrow">Library</p>
          <h3>Квизы</h3>
        </div>
        <button className="primary-button" type="button" onClick={() => openEditor()}>
          <Plus size={17} />
          Создать
        </button>
      </div>

      <div className="filter-row">
        <label className="search-box inline">
          <Search size={18} />
          <input
            value={search}
            placeholder="Название или описание"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as QuizCategory)}
        >
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

      {quizzes.isLoading ? <PageStatus text="Загрузка квизов" /> : null}
      {quizzes.data ? <QuizTable quizzes={quizzes.data.items} onEdit={openEditor} /> : null}
      {quizzes.isError ? (
        <PageStatus
          text="Не удалось загрузить квизы"
          tone="error"
          onRetry={() => void quizzes.refetch()}
        />
      ) : null}
    </section>
  );
}
