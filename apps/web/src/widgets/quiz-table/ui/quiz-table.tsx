import { memo } from 'react';
import { FilePenLine } from 'lucide-react';
import { Role, type QuizCard } from '@quizparty/shared';
import { labels, QuizCoverThumb, StatusPill } from '@entities/quiz';
import { useAppStore } from '@shared/model/app-store';
import { Button, EmptyState } from '@shared/ui';
import { QuizTableRow } from './quiz-table-row';
import styles from './quiz-table.module.scss';

export const QuizTable = memo(function QuizTable({
  emptyDescription = 'Создайте первый квиз или измените фильтры.',
  emptyTitle = 'Квизов пока нет',
  onEmptyAction,
  quizzes,
  onEdit,
}: {
  emptyDescription?: string;
  emptyTitle?: string;
  onEmptyAction?: (() => void) | undefined;
  quizzes: QuizCard[];
  onEdit: (quizId: string) => void;
}) {
  const currentUser = useAppStore((state) => state.currentUser);
  const showAuthor = currentUser?.role === Role.ADMIN;
  if (!quizzes.length) {
    return (
      <EmptyState>
        <strong>{emptyTitle}</strong>
        <span>{emptyDescription}</span>
        {onEmptyAction ? (
          <Button variant="secondary" onClick={onEmptyAction}>
            Сбросить фильтры
          </Button>
        ) : null}
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Квиз</th>
              <th>Категория</th>
              <th>Сложность</th>
              <th>Статус</th>
              <th>Вопросы</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <QuizTableRow key={quiz.id} quiz={quiz} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileCardList} aria-label="Список квизов">
        {quizzes.map((quiz) => (
          <QuizMobileCard key={quiz.id} quiz={quiz} showAuthor={showAuthor} onEdit={onEdit} />
        ))}
      </div>
    </>
  );
});

const QuizMobileCard = memo(function QuizMobileCard({
  quiz,
  showAuthor,
  onEdit,
}: {
  quiz: QuizCard;
  showAuthor: boolean;
  onEdit: (quizId: string) => void;
}) {
  return (
    <article className={styles.mobileCard}>
      <div className={styles.quizMobileCard}>
        <div className={styles.quizMobileHead}>
          <QuizCoverThumb coverUrl={quiz.coverUrl} themeColor={quiz.themeColor} />
          <div className={styles.quizMobileTitle}>
            <strong>{quiz.title}</strong>
            {showAuthor ? <span>{quiz.authorName}</span> : null}
          </div>
          <span className={styles.pillWrap}>
            <StatusPill status={quiz.status} />
          </span>
        </div>

        <dl className={styles.quizMobileMeta}>
          <div>
            <dt>Категория</dt>
            <dd>{labels[quiz.category]}</dd>
          </div>
          <div>
            <dt>Сложность</dt>
            <dd>{labels[quiz.difficulty]}</dd>
          </div>
          <div>
            <dt>Вопросы</dt>
            <dd>{quiz.questionCount}</dd>
          </div>
        </dl>

        <Button
          className={styles.quizMobileAction}
          variant="secondary"
          onClick={() => onEdit(quiz.id)}
        >
          <FilePenLine size={17} />
          Редактировать
        </Button>
      </div>
    </article>
  );
});
