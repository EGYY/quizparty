import { LoginForm, RegisterForm } from '@features/auth';
import { useLoginPage } from './model/use-login-page';
import { AuthModeTabs } from './ui/auth-mode-tabs';
import { AuthShell } from './ui/auth-shell';

export default function LoginPage() {
  const { isRegisterMode, mode, setMode, successTarget } = useLoginPage();

  return (
    <AuthShell isRegisterMode={isRegisterMode}>
      <AuthModeTabs mode={mode} onModeChange={setMode} />
      {isRegisterMode ? (
        <RegisterForm successTarget={successTarget} />
      ) : (
        <LoginForm successTarget={successTarget} />
      )}
    </AuthShell>
  );
}
