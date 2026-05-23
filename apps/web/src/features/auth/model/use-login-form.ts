import { useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginRequestSchema } from '@quizparty/shared';
import type { LoginRequest } from '@quizparty/shared';
import { loginAdmin } from '../api/admin-auth';
import { describeRequestError } from '@shared/api';
import { useToastStore } from '@shared/ui';

const loginResolver: Resolver<LoginRequest> = (values) => {
  const parsed = loginRequestSchema.safeParse(values);
  if (parsed.success) {
    return { values: parsed.data, errors: {} };
  }
  const fieldErrors = parsed.error.flatten().fieldErrors;
  return {
    values: {},
    errors: {
      ...(fieldErrors.email?.length
        ? { email: { type: 'validation', message: 'Введите корректный email' } }
        : {}),
      ...(fieldErrors.password?.length
        ? { password: { type: 'validation', message: 'Пароль не короче 6 символов' } }
        : {}),
    },
  };
};

export function useLoginForm(successTarget: string) {
  const navigate = useNavigate();
  const notify = useToastStore((state) => state.notify);

  const form = useForm<LoginRequest>({
    defaultValues: { email: '', password: '' },
    resolver: loginResolver,
  });

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      void navigate(successTarget, { replace: true });
    },
    onError: (error) => {
      const message = describeRequestError(error, 'Проверьте email и пароль.');
      if (!message) return;
      notify({ tone: 'error', title: 'Не удалось войти', message });
    },
  });

  const onSubmit = useCallback((values: LoginRequest) => mutation.mutate(values), [mutation]);

  return { form, mutation, onSubmit };
}
