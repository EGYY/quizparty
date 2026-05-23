import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@shared/ui';
import { useLoginForm } from '../model/use-login-form';
import { AuthField } from './auth-field';
import { PasswordInput } from './password-input';
import styles from './auth.module.scss';

export function LoginForm({ successTarget }: { successTarget: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const { form, mutation, onSubmit } = useLoginForm(successTarget);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
    >
      <AuthField label="Email" error={form.formState.errors.email?.message}>
        <input
          {...form.register('email')}
          type="email"
          autoComplete="email"
          aria-invalid={form.formState.errors.email ? true : undefined}
        />
      </AuthField>
      <AuthField label="Пароль" error={form.formState.errors.password?.message}>
        <PasswordInput
          autoComplete="current-password"
          isVisible={showPassword}
          toggleLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          field={form.register('password')}
          invalid={Boolean(form.formState.errors.password)}
          onToggle={() => setShowPassword((v) => !v)}
        />
      </AuthField>
      <Button disabled={mutation.isPending} type="submit" variant="primary">
        <ShieldCheck size={18} />
        {mutation.isPending ? 'Входим...' : 'Войти'}
      </Button>
    </form>
  );
}
