import { useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginRequestSchema } from '@quizparty/shared';
import type { LoginRequest } from '@quizparty/shared';
import { loginAdmin } from '@features/auth';
import { logoMarkUrl } from '@shared/lib/assets';
import { useToastStore } from '@shared/ui/toast';

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

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useToastStore((state) => state.notify);

  const login = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      const from =
        typeof location.state === 'object' &&
        location.state &&
        'from' in location.state &&
        typeof location.state.from === 'string'
          ? location.state.from
          : '/admin';

      void navigate(from, { replace: true });
    },
    onError: () =>
      notify({
        tone: 'error',
        title: 'Не удалось войти',
        message: 'Проверьте email и пароль.',
      }),
  });

  const onLogin = useCallback((values: LoginRequest) => login.mutate(values), [login]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: { email: '', password: '' },
    resolver: loginResolver,
  });

  return (
    <main className="login-screen">
      <form
        className="login-panel"
        onSubmit={(event) => {
          void handleSubmit(onLogin)(event);
        }}
      >
        <div className="brand-lockup">
          <img alt="" className="brand-mark-image large" src={logoMarkUrl} />
          <div>
            <p className="eyebrow">QuizParty</p>
            <h1>Admin Console</h1>
          </div>
        </div>
        <label>
          Email
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
          />
          {errors.email ? (
            <small className="field-error" role="alert">
              {errors.email.message}
            </small>
          ) : null}
        </label>
        <label>
          Password
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
          />
          {errors.password ? (
            <small className="field-error" role="alert">
              {errors.password.message}
            </small>
          ) : null}
        </label>
        <button className="primary-button" disabled={login.isPending} type="submit">
          <ShieldCheck size={18} />
          {login.isPending ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </main>
  );
}
