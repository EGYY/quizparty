import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import styles from './search-field.module.scss';

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SearchField({
  className,
  inline,
  label,
  inputClassName,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> & {
  className?: string;
  inline?: boolean;
  inputClassName?: string;
  label: string;
}) {
  return (
    <label className={cx(styles.root, inline && styles.inline, className)}>
      <Search size={18} />
      <input
        {...props}
        aria-label={props['aria-label'] ?? label}
        className={cx(styles.input, inputClassName)}
        type="search"
      />
    </label>
  );
}
