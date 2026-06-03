import { FieldError } from '../field-error';
import editorStyles from '../quiz-editor.module.scss';
import styles from './question-editor-panel.module.scss';

export function QuestionTextField({
  error,
  value,
  onChange,
}: {
  error: string | undefined;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={`${editorStyles.field}${error ? ` ${editorStyles.hasError}` : ''}`}>
      <label className={`${editorStyles.label} ${editorStyles.required}`}>Текст вопроса</label>
      <textarea
        className={styles.textareaTall}
        placeholder="Введите текст вопроса…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError message={error} />
    </div>
  );
}
