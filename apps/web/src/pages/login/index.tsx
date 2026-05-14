import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LoginRequest } from '@quizparty/shared';
import { loginAdmin } from '@shared/api/auth';
import { logoMarkUrl } from '@shared/lib/assets';
import { useToastStore } from '@shared/ui/toast';

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

  const { register, handleSubmit } = useForm<LoginRequest>({
    defaultValues: {
      email: 'admin@quizparty.local',
      password: 'local-dev',
    },
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
          <input {...register('email')} type="email" />
        </label>
        <label>
          Password
          <input {...register('password')} type="password" />
        </label>
        <button className="primary-button" disabled={login.isPending} type="submit">
          <ShieldCheck size={18} />
          {login.isPending ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </main>
  );
}
