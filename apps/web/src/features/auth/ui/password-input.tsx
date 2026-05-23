import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import styles from './password-input.module.scss';

export function PasswordInput({
  autoComplete,
  field,
  invalid,
  isVisible,
  toggleLabel,
  onToggle,
}: {
  autoComplete: string;
  field: UseFormRegisterReturn;
  invalid: boolean;
  isVisible: boolean;
  toggleLabel: string;
  onToggle: () => void;
}) {
  return (
    <span className={styles.wrap}>
      <input
        {...field}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        aria-invalid={invalid ? true : undefined}
      />
      <button aria-label={toggleLabel} type="button" onClick={onToggle}>
        {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </span>
  );
}
