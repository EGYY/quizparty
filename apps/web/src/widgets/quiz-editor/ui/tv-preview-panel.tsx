import { memo } from 'react';
import type { QuizDraft, QuizDraftQuestion } from '@quizparty/shared';
import { labels } from '@entities/quiz';
import { resolveAssetUrl } from '@shared/lib/assets';
import { OPTION_LABELS } from '../lib/constants';
import { useObjectUrl } from '../lib/media';
import styles from './quiz-editor.module.scss';

export const TVPreviewPanel = memo(function TVPreviewPanel({
  draft,
  pendingCoverFile,
  question,
}: {
  draft: QuizDraft;
  pendingCoverFile: File | undefined;
  question: QuizDraftQuestion | undefined;
}) {
  const pendingCoverUrl = useObjectUrl(pendingCoverFile);
  const cover = pendingCoverUrl ?? resolveAssetUrl(draft.coverUrl);

  return (
    <div className={`panel ${styles.previewPanel}`}>
      <p className="eyebrow">TV Preview</p>
      {cover ? (
        <div
          className={`${styles.previewCard} ${styles.coverPreview}`}
          style={{ backgroundColor: draft.themeColor ?? '#ffb45f' }}
        >
          <img alt="" loading="lazy" src={cover} />
          <span>{labels[draft.category]}</span>
          <h3 className={styles.coverTitle}>{draft.title || '—'}</h3>
        </div>
      ) : null}
      {question ? (
        <div className={styles.tvMock}>
          <p className={styles.tvQuestion}>{question.questionText || 'Текст вопроса…'}</p>
          <div className={styles.tvOptions}>
            {question.options.map((option, index) => (
              <div
                className={`${styles.tvOpt}${question.correctIndex === index ? ` ${styles.correctTvOpt}` : ''}`}
                key={index}
              >
                <span>{OPTION_LABELS[index]}</span>
                <p>{option || `Вариант ${OPTION_LABELS[index]}`}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
