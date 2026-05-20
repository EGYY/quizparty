import { memo } from 'react';
import { FilePenLine } from 'lucide-react';
import type { QuizCard } from '@quizparty/shared';
import { labels, QuizCoverThumb, StatusPill } from '@entities/quiz';

export const QuizTableRow = memo(function QuizTableRow({
  quiz,
  onEdit,
}: {
  quiz: QuizCard;
  onEdit: (quizId: string) => void;
}) {
  return (
    <tr>
      <td>
        <div className="quiz-cell">
          <QuizCoverThumb coverUrl={quiz.coverUrl} themeColor={quiz.themeColor} />
          <div>
            <strong>{quiz.title}</strong>
            <span>{quiz.authorName}</span>
          </div>
        </div>
      </td>
      <td>{labels[quiz.category]}</td>
      <td>{labels[quiz.difficulty]}</td>
      <td>
        <StatusPill status={quiz.status} />
      </td>
      <td>{quiz.questionCount}</td>
      <td>
        <button
          className="icon-button"
          type="button"
          title="Редактировать"
          onClick={() => onEdit(quiz.id)}
        >
          <FilePenLine size={17} />
        </button>
      </td>
    </tr>
  );
});
