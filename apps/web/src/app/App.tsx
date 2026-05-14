import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from '@shared/model/app-store';
import { PageStatus } from '@shared/ui/page-status';
import { AdminAuthGate } from './ui/admin-auth-gate';
import { AdminLayout } from './ui/admin-layout';

const DashboardPage = lazy(() => import('@pages/dashboard'));
const QuizzesPage = lazy(() => import('@pages/quizzes'));
const EditorPage = lazy(() => import('@pages/editor'));
const ReviewPage = lazy(() => import('@pages/review'));
const LoginPage = lazy(() => import('@pages/login'));
const PhoneControllerPage = lazy(() => import('@pages/phone-controller'));

function LoginRoute() {
  const accessToken = useAppStore((state) => state.accessToken);
  if (accessToken) return <Navigate replace to="/admin" />;
  return <LoginPage />;
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageStatus text="Загрузка интерфейса" />}>
        <Routes>
          <Route element={<PhoneControllerPage />} path="/" />
          <Route element={<PhoneControllerPage />} path="/join" />
          <Route element={<PhoneControllerPage />} path="/join/:roomCode" />
          <Route element={<LoginRoute />} path="/admin/login" />
          <Route element={<AdminAuthGate />}>
            <Route element={<AdminLayout />} path="/admin">
              <Route index element={<DashboardPage />} />
              <Route element={<QuizzesPage />} path="quizzes" />
              <Route element={<EditorPage />} path="editor" />
              <Route element={<EditorPage />} path="editor/:quizId" />
              <Route element={<ReviewPage />} path="review" />
            </Route>
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
