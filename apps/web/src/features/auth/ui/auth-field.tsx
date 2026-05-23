import type { ReactNode } from 'react';
import { FormError } from '@shared/ui';

export function AuthField({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string | undefined;
  label: string;
}) {
  return (
    <label>
      {label}
      {children}
      {error ? <FormError>{error}</FormError> : null}
    </label>
  );
}
