import { AlertCircle } from 'lucide-react';
import { FormError } from '@shared/ui';
import styles from './quiz-editor.module.scss';

export function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <FormError className={styles.fieldError}>
      <AlertCircle size={12} />
      {message}
    </FormError>
  );
}
