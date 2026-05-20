import { memo } from 'react';
import type { QuizCard } from '@quizparty/shared';
import { QuizTableRow } from './quiz-table-row';

export const QuizTable = memo(function QuizTable({
  quizzes,
  onEdit,
}: {
  quizzes: QuizCard[];
  onEdit: (quizId: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
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
  );
});
