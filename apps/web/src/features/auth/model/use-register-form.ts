import { useCallback } from 'react';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerRequestSchema } from '@quizparty/shared';
import type { RegisterRequest } from '@quizparty/shared';
import { registerAuthor } from '../api/admin-auth';
import { describeRequestError } from '@shared/api';
import { useToastStore } from '@shared/ui';

export type RegisterFormValues = RegisterRequest & { confirmPassword: string };

const registerResolver: Resolver<RegisterFormValues> = (values) => {
  const parsed = registerRequestSchema.safeParse({
    email: values.email,
    name: values.name,
    password: values.password,
  });
  const errors: FieldErrors<RegisterFormValues> = {};

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    if (fieldErrors.email?.length) {
      errors.email = { type: 'validation', message: 'Введите корректный email' };
    }
    if (fieldErrors.name?.length) {
      errors.name = { type: 'validation', message: 'Имя должно быть от 2 до 80 символов' };
    }
    if (fieldErrors.password?.length) {
      errors.password = {
        type: 'validation',
        message: 'Минимум 8 символов, одна цифра и один знак или буква',
      };
    }
  }

  if (!values.confirmPassword || values.confirmPassword !== values.password) {
    errors.confirmPassword = { type: 'validation', message: 'Пароли должны совпадать' };
  }

  if (Object.keys(errors).length > 0 || !parsed.success) {
    return { values: {}, errors };
  }

  return {
    values: { ...parsed.data, confirmPassword: values.confirmPassword },
    errors: {},
  };
};

export function useRegisterForm(successTarget: string) {
  const navigate = useNavigate();
  const notify = useToastStore((state) => state.notify);

  const form = useForm<RegisterFormValues>({
    defaultValues: { email: '', name: '', password: '', confirmPassword: '' },
    resolver: registerResolver,
  });

  const mutation = useMutation({
    mutationFn: registerAuthor,
    onSuccess: () => {
      void navigate(successTarget, { replace: true });
    },
    onError: (error) => {
      const message = describeRequestError(error, 'Проверьте данные или попробуйте другой email.');
      if (!message) return;
      notify({ tone: 'error', title: 'Не удалось зарегистрироваться', message });
    },
  });

  const onSubmit = useCallback(
    ({ confirmPassword: _confirmPassword, ...values }: RegisterFormValues) =>
      mutation.mutate(values),
    [mutation],
  );

  return { form, mutation, onSubmit };
}
