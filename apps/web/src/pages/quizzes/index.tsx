import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listAdminQuizzes } from '@entities/quiz';
import { QuizFilters, useQuizFilters } from '@features/filter-quizzes';
import { queryKeys } from '@shared/api/query-keys';
import { PageStatus } from '@shared/ui/page-status';
import { QuizTable } from '@widgets/quiz-table';

export default function QuizzesPage() {
  const navigate = useNavigate();
  const quizFilters = useQuizFilters();

  const quizzes = useQuery({
    queryKey: queryKeys.adminQuizzes(quizFilters.filters),
    queryFn: ({ signal }) => listAdminQuizzes(quizFilters.filters, signal),
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

      <QuizFilters
        category={quizFilters.category}
        search={quizFilters.search}
        setCategory={quizFilters.setCategory}
        setSearch={quizFilters.setSearch}
        setSort={quizFilters.setSort}
        setStatus={quizFilters.setStatus}
        sort={quizFilters.sort}
        status={quizFilters.status}
      />

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
