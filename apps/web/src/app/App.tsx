import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PageStatus } from '@shared/ui';
import { AdminAuthGate } from './ui/admin-auth-gate';
import { AdminLayout } from './ui/admin-layout';
import { AdminOnlyRoute } from './ui/admin-only-route';
import { LoginRoute } from './ui/login-route';

const DashboardPage = lazy(() => import('@pages/dashboard'));
const QuizzesPage = lazy(() => import('@pages/quizzes'));
const EditorPage = lazy(() => import('@pages/editor'));
const ReviewPage = lazy(() => import('@pages/review'));
const PhoneControllerPage = lazy(() => import('@pages/phone-controller'));
const NotFoundPage = lazy(() => import('@pages/not-found'));

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
              <Route
                element={
                  <AdminOnlyRoute>
                    <ReviewPage />
                  </AdminOnlyRoute>
                }
                path="review"
              />
            </Route>
          </Route>
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
