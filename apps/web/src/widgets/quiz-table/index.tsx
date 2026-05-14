import { memo } from 'react';
import { FilePenLine, ImagePlus } from 'lucide-react';
import type { QuizCard } from '@quizparty/shared';
import { labels } from '@shared/config/labels';
import { resolveAssetUrl } from '@shared/lib/assets';
import { StatusPill } from '@shared/ui/status-pill';

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
          {quizzes.map((quiz) => {
            const cover = resolveAssetUrl(quiz.coverUrl);

            return (
              <tr key={quiz.id}>
                <td>
                  <div className="quiz-cell">
                    <div
                      className="cover-thumb"
                      style={{ backgroundColor: quiz.themeColor ?? '#ffb45f' }}
                    >
                      {cover ? <img alt="" loading="lazy" src={cover} /> : <ImagePlus size={18} />}
                    </div>
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
          })}
        </tbody>
      </table>
    </div>
  );
});
