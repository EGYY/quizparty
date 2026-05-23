import { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuizFilters } from '@features/filter-quizzes';
import { Button, Eyebrow, PageStatus } from '@shared/ui';
import layout from '@shared/ui/layout.module.scss';
import { QuizTable } from '@widgets/quiz-table';
import { useAdminQuizzes } from '../model/use-admin-quizzes';

export function AdminQuizzesWidget() {
  const navigate = useNavigate();
  const { quizFilters, quizzes } = useAdminQuizzes();

  const openEditor = useCallback(
    (quizId?: string) => {
      void navigate(quizId ? `/admin/editor/${quizId}` : '/admin/editor');
    },
    [navigate],
  );

  return (
    <section className={`${layout.panel} ${layout.fullPanel}`}>
      <div className={`${layout.panelHeader} ${layout.filtersHeader}`}>
        <div>
          <Eyebrow>Library</Eyebrow>
          <h3>Квизы</h3>
        </div>
        <Button variant="primary" onClick={() => openEditor()}>
          <Plus size={17} />
          Создать
        </Button>
      </div>

      <QuizFilters
        category={quizFilters.category}
        activeFilterCount={quizFilters.activeFilterCount}
        onReset={quizFilters.resetFilters}
        search={quizFilters.search}
        setCategory={quizFilters.setCategory}
        setSearch={quizFilters.setSearch}
        setSort={quizFilters.setSort}
        setStatus={quizFilters.setStatus}
        sort={quizFilters.sort}
        status={quizFilters.status}
      />

      {quizzes.isLoading ? <PageStatus text="Загрузка квизов" /> : null}
      {quizzes.data ? (
        <QuizTable
          emptyDescription={
            quizFilters.activeFilterCount > 0
              ? 'Попробуйте сбросить фильтры или изменить поиск.'
              : 'Создайте первый квиз и отправьте его на ревью.'
          }
          emptyTitle={
            quizFilters.activeFilterCount > 0 ? 'По фильтрам ничего не найдено' : 'Квизов пока нет'
          }
          onEmptyAction={quizFilters.activeFilterCount > 0 ? quizFilters.resetFilters : undefined}
          quizzes={quizzes.data.items}
          onEdit={openEditor}
        />
      ) : null}
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
