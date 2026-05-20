import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '@features/admin-dashboard';
import { queryKeys } from '@shared/api/query-keys';
import { popcornMascotUrl } from '@shared/lib/assets';
import { PageStatus } from '@shared/ui/page-status';
import { QualityPanel } from '@widgets/quality-panel';
import { QuizTable } from '@widgets/quiz-table';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dashboard = useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: ({ signal }) => getDashboard(signal),
  });

  const openEditor = useCallback(
    (quizId?: string) => {
      void navigate(quizId ? `/admin/editor/${quizId}` : '/admin/editor');
    },
    [navigate],
  );
  const openReview = useCallback(() => {
    void navigate('/admin/review');
  }, [navigate]);

  if (dashboard.isLoading) return <PageStatus text="Загрузка дашборда" />;
  if (!dashboard.data) {
    return (
      <PageStatus text="Backend недоступен" tone="error" onRetry={() => void dashboard.refetch()} />
    );
  }

  const stats = [
    ['Всего', dashboard.data.stats.totalQuizzes, 'violet'],
    ['На ревью', dashboard.data.stats.pendingReview, 'orange'],
    ['Черновики', dashboard.data.stats.drafts, 'blue'],
    ['Одобрено', dashboard.data.stats.approved, 'green'],
    ['Отклонено', dashboard.data.stats.rejected, 'red'],
  ] as const;

  return (
    <section className="view-stack">
      <div className="stat-grid">
        {stats.map(([label, value, tone]) => (
          <div className={`stat-tile ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel dashboard-table">
          <div className="panel-header">
            <h3>Последние квизы</h3>
            <button className="secondary-button" type="button" onClick={() => openEditor()}>
              <Plus size={17} />
              Новый
            </button>
          </div>
          <QuizTable quizzes={dashboard.data.recentQuizzes} onEdit={openEditor} />
        </section>

        <aside className="side-stack">
          <section className="panel quality-card">
            <div className="panel-header">
              <h3>Качество контента</h3>
              <button
                className="icon-button"
                type="button"
                title="Открыть ревью"
                onClick={openReview}
              >
                <ArrowUpRight size={17} />
              </button>
            </div>
            <QualityPanel warnings={dashboard.data.qualityWarnings} />
          </section>

          <section className="panel quick-card">
            <div>
              <p className="eyebrow">Quick Action</p>
              <h3>Соберите новый квиз для вечеринки</h3>
              <button className="primary-button" type="button" onClick={() => openEditor()}>
                <Plus size={17} />
                Создать квиз
              </button>
            </div>
            <img alt="" loading="lazy" src={popcornMascotUrl} />
          </section>
        </aside>
      </div>
    </section>
  );
}
