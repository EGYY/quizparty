import { useCallback } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard, type DashboardStatTone } from '@features/admin-dashboard';
import { popcornMascotUrl } from '@shared/lib';
import { Button, Eyebrow, IconButton, PageStatus } from '@shared/ui';
import layout from '@shared/ui/layout.module.scss';
import { QualityPanel } from '@widgets/quality-panel';
import { QuizTable } from '@widgets/quiz-table';
import styles from './admin-dashboard-widget.module.scss';

const TONE_CLASSES: Record<DashboardStatTone, string | undefined> = {
  violet: styles.violet,
  orange: styles.orange,
  blue: styles.blue,
  green: styles.green,
  red: styles.red,
};

export function AdminDashboardWidget() {
  const navigate = useNavigate();
  const { dashboard, isAdmin, stats } = useAdminDashboard();

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

  return (
    <section className={layout.viewStack}>
      <div className={styles.mobilePageCta}>
        <div>
          <Eyebrow>{isAdmin ? 'Admin Dashboard' : 'Author Dashboard'}</Eyebrow>
          <h3>{isAdmin ? 'Управление квизами' : 'Ваши квизы'}</h3>
        </div>
        <Button variant="primary" onClick={() => openEditor()}>
          <Plus size={17} />
          Создать
        </Button>
      </div>

      <div className={styles.statGrid}>
        {stats.map(({ label, tone, value }) => (
          <div className={`${styles.statTile} ${TONE_CLASSES[tone]}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <section className={layout.panel}>
          <div className={layout.panelHeader}>
            <h3>Последние квизы</h3>
            <Button variant="secondary" onClick={() => openEditor()}>
              <Plus size={17} />
              Новый
            </Button>
          </div>
          <QuizTable
            emptyDescription="Создайте первый квиз, заполните вопросы и отправьте его на ревью."
            quizzes={dashboard.data.recentQuizzes}
            onEdit={openEditor}
          />
        </section>

        <aside className={styles.sideStack}>
          <section className={layout.panel}>
            <div className={layout.panelHeader}>
              <h3>{isAdmin ? 'Качество контента' : 'Качество ваших квизов'}</h3>
              {isAdmin ? (
                <IconButton label="Открыть ревью" title="Открыть ревью" onClick={openReview}>
                  <ArrowUpRight size={17} />
                </IconButton>
              ) : null}
            </div>
            <QualityPanel warnings={dashboard.data.qualityWarnings} />
          </section>

          <section className={`${layout.panel} ${styles.quickCard}`}>
            <div>
              <Eyebrow>Quick Action</Eyebrow>
              <h3>
                {isAdmin
                  ? 'Соберите новый квиз для вечеринки'
                  : 'Создайте квиз и отправьте его на ревью'}
              </h3>
              <Button variant="primary" onClick={() => openEditor()}>
                <Plus size={17} />
                Создать квиз
              </Button>
            </div>
            <img alt="" loading="lazy" src={popcornMascotUrl} />
          </section>
        </aside>
      </div>
    </section>
  );
}
