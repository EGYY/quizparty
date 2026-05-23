import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@shared/ui';
import { useRegisterForm } from '../model/use-register-form';
import { AuthField } from './auth-field';
import { PasswordInput } from './password-input';
import styles from './auth.module.scss';

export function RegisterForm({ successTarget }: { successTarget: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { form, mutation, onSubmit } = useRegisterForm(successTarget);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
    >
      <AuthField label="Имя автора" error={form.formState.errors.name?.message}>
        <input
          {...form.register('name')}
          type="text"
          autoComplete="name"
          aria-invalid={form.formState.errors.name ? true : undefined}
        />
      </AuthField>
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
          autoComplete="new-password"
          isVisible={showPassword}
          toggleLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          field={form.register('password')}
          invalid={Boolean(form.formState.errors.password)}
          onToggle={() => setShowPassword((v) => !v)}
        />
      </AuthField>
      <AuthField label="Повторите пароль" error={form.formState.errors.confirmPassword?.message}>
        <PasswordInput
          autoComplete="new-password"
          isVisible={showConfirm}
          toggleLabel={showConfirm ? 'Скрыть повтор пароля' : 'Показать повтор пароля'}
          field={form.register('confirmPassword')}
          invalid={Boolean(form.formState.errors.confirmPassword)}
          onToggle={() => setShowConfirm((v) => !v)}
        />
      </AuthField>
      <p className={styles.helper}>
        После регистрации вы сможете создавать и редактировать свои квизы. Публикацию подтверждает
        администратор.
      </p>
      <Button disabled={mutation.isPending} type="submit" variant="primary">
        <UserPlus size={18} />
        {mutation.isPending ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}
