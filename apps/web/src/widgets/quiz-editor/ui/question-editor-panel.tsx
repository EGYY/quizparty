import { memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { QuizDraftQuestion } from '@quizparty/shared';
import { OPTION_LABELS } from '../lib/constants';
import type { QuestionErrors } from '../model/types';
import { FieldError } from './field-error';
import { QuestionMediaSection } from './question-media-section';
import styles from './quiz-editor.module.scss';

export const QuestionEditorPanel = memo(function QuestionEditorPanel({
  count,
  errors,
  index,
  pendingMediaFile,
  pendingRevealMediaFile,
  question,
  onChange,
  onMediaFileChange,
  onNavigate,
  onRemove,
  onRevealMediaFileChange,
}: {
  count: number;
  errors: QuestionErrors;
  index: number;
  pendingMediaFile: File | undefined;
  pendingRevealMediaFile: File | undefined;
  question: QuizDraftQuestion;
  onChange: (patch: Partial<QuizDraftQuestion>) => void;
  onMediaFileChange: (file: File | undefined) => void;
  onNavigate: (index: number) => void;
  onRemove: () => void;
  onRevealMediaFileChange: (file: File | undefined) => void;
}) {
  const setOption = useCallback(
    (optionIndex: number, value: string) => {
      onChange({
        options: question.options.map((option, index) => (index === optionIndex ? value : option)),
      });
    },
    [onChange, question.options],
  );

  const emptyOptionsCount = errors.options.filter(Boolean).length;

  return (
    <div className={styles.questionPanel}>
      <div className={styles.questionHeader}>
        <div className={styles.questionNav}>
          <button
            className="icon-button"
            disabled={index === 0}
            title="Предыдущий вопрос"
            type="button"
            onClick={() => onNavigate(index - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.questionCounter}>
            Вопрос {index + 1} / {count}
          </span>
          <button
            className="icon-button"
            disabled={index === count - 1}
            title="Следующий вопрос"
            type="button"
            onClick={() => onNavigate(index + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          className="icon-button danger"
          title="Удалить вопрос"
          type="button"
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className={`${styles.field}${errors.questionText ? ` ${styles.hasError}` : ''}`}>
        <label className={styles.label}>Текст вопроса</label>
        <textarea
          className={styles.textareaTall}
          placeholder="Введите текст вопроса…"
          value={question.questionText}
          onChange={(e) => onChange({ questionText: e.target.value })}
        />
        <FieldError message={errors.questionText} />
      </div>

      <div className={`${styles.field}${emptyOptionsCount > 0 ? ` ${styles.hasError}` : ''}`}>
        <span className={styles.label}>
          Варианты ответа <small>(нажмите на букву, чтобы отметить правильный)</small>
        </span>
        <div className={styles.optionsGrid}>
          {question.options.map((option, index) => (
            <div
              className={[
                styles.option,
                question.correctIndex === index ? styles.correctOption : '',
                errors.options[index] ? styles.errorOption : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={index}
            >
              <button
                className={`${styles.optionBtn}${question.correctIndex === index ? ` ${styles.correctOptionBtn}` : ''}`}
                title={`Сделать вариант ${OPTION_LABELS[index]} правильным`}
                type="button"
                onClick={() => onChange({ correctIndex: index })}
              >
                {OPTION_LABELS[index]}
              </button>
              <input
                className={styles.optionInput}
                placeholder={`Вариант ${OPTION_LABELS[index]}…`}
                value={option}
                onChange={(e) => setOption(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        {emptyOptionsCount > 0 ? (
          <FieldError message={`Заполните все варианты ответа (${emptyOptionsCount} пустых)`} />
        ) : null}
      </div>

      <QuestionMediaSection
        currentMedia={question.media}
        pendingFile={pendingMediaFile}
        title="Медиа вопроса"
        uploadTitle="Изображение, видео или аудио"
        onChange={(media) => onChange({ media })}
        onFileChange={onMediaFileChange}
      />

      <QuestionMediaSection
        currentMedia={question.revealMedia}
        pendingFile={pendingRevealMediaFile}
        title="Медиа при показе ответа"
        uploadTitle="Расширенный фрагмент для правильного ответа"
        onChange={(revealMedia) => onChange({ revealMedia })}
        onFileChange={onRevealMediaFileChange}
      />

      <div className={styles.field}>
        <label className={styles.label}>
          Объяснение <small>(необязательно)</small>
        </label>
        <textarea
          placeholder="Поясните правильный ответ…"
          value={question.explanation ?? ''}
          onChange={(e) => onChange({ explanation: e.target.value || undefined })}
        />
      </div>
    </div>
  );
});
