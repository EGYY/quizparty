import { AlertCircle } from 'lucide-react';
import styles from './quiz-editor.module.scss';

export function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <span className={styles.fieldError}>
      <AlertCircle size={12} />
      {message}
    </span>
  );
}
