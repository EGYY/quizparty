import { memo, useCallback } from 'react';
import type { QuizDraftQuestion } from '@quizparty/shared';
import type { QuestionErrors } from '../../model/types';
import { QuestionMediaSection } from '../question-media-section';
import editorStyles from '../quiz-editor.module.scss';
import { AnswerOptionsEditor } from './answer-options-editor';
import { QuestionHeaderControls } from './question-header-controls';
import { QuestionTextField } from './question-text-field';
import styles from './question-editor-panel.module.scss';

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

  const addOption = useCallback(() => {
    if (question.options.length >= 4) return;
    onChange({ options: [...question.options, ''] });
  }, [onChange, question.options]);

  const removeOption = useCallback(
    (optionIndex: number) => {
      if (question.options.length <= 2) return;
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      let newCorrectIndex = question.correctIndex;
      if (optionIndex < question.correctIndex) {
        newCorrectIndex = question.correctIndex - 1;
      } else if (optionIndex === question.correctIndex) {
        newCorrectIndex = 0;
      }
      onChange({ options: newOptions, correctIndex: newCorrectIndex });
    },
    [onChange, question.options, question.correctIndex],
  );

  return (
    <div className={styles.questionPanel}>
      <QuestionHeaderControls
        count={count}
        index={index}
        onNavigate={onNavigate}
        onRemove={onRemove}
      />

      <QuestionTextField
        error={errors.questionText}
        value={question.questionText}
        onChange={(questionText) => onChange({ questionText })}
      />

      <AnswerOptionsEditor
        correctIndex={question.correctIndex}
        errors={errors.options}
        options={question.options}
        onCorrectIndexChange={(correctIndex) => onChange({ correctIndex })}
        onOptionChange={setOption}
        onAddOption={addOption}
        onRemoveOption={removeOption}
      />

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

      <div className={editorStyles.field}>
        <label className={editorStyles.label}>
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
