import { OPTION_LABELS } from '../../lib/constants';
import { FieldError } from '../field-error';
import editorStyles from '../quiz-editor.module.scss';
import styles from './question-editor-panel.module.scss';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

export function AnswerOptionsEditor({
  correctIndex,
  errors,
  options,
  onCorrectIndexChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}: {
  correctIndex: number;
  errors: (string | undefined)[];
  options: string[];
  onCorrectIndexChange: (index: number) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}) {
  const emptyOptionsCount = errors.filter(Boolean).length;
  const canRemove = options.length > MIN_OPTIONS;
  const canAdd = options.length < MAX_OPTIONS;

  return (
    <div
      className={`${editorStyles.field}${emptyOptionsCount > 0 ? ` ${editorStyles.hasError}` : ''}`}
    >
      <span className={editorStyles.label}>
        Варианты ответа <small>(нажмите на букву, чтобы отметить правильный)</small>
      </span>
      <div className={styles.optionsGrid}>
        {options.map((option, index) => (
          <div
            className={[
              styles.option,
              correctIndex === index ? styles.correctOption : '',
              errors[index] ? styles.errorOption : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={index}
          >
            <button
              className={`${styles.optionBtn}${correctIndex === index ? ` ${styles.correctOptionBtn}` : ''}`}
              title={`Сделать вариант ${OPTION_LABELS[index]} правильным`}
              type="button"
              onClick={() => onCorrectIndexChange(index)}
            >
              {OPTION_LABELS[index]}
            </button>
            <input
              className={styles.optionInput}
              placeholder={`Вариант ${OPTION_LABELS[index]}…`}
              value={option}
              onChange={(event) => onOptionChange(index, event.target.value)}
            />
            {canRemove ? (
              <button
                className={styles.removeOptionBtn}
                title="Удалить вариант"
                type="button"
                onClick={() => onRemoveOption(index)}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {canAdd ? (
        <button className={styles.addOptionBtn} type="button" onClick={onAddOption}>
          + Добавить вариант
        </button>
      ) : null}
      {emptyOptionsCount > 0 ? (
        <FieldError message={`Заполните все варианты ответа (${emptyOptionsCount} пустых)`} />
      ) : null}
    </div>
  );
}
