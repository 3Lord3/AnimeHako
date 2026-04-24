import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { HomePage } from '@/pages/HomePage';
import { AnimeDetailPage } from '@/pages/AnimeDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { UserAnimeListPage } from '@/pages/UserAnimeListPage';
import { useUser } from '@/hooks';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) {
    return <SuspenseFallback message="Проверка авторизации..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<div className="text-center py-12">Загрузка...</div>}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="login"
            element={
              <Suspense fallback={<div className="text-center py-12">Загрузка...</div>}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="register"
            element={
              <Suspense fallback={<div className="text-center py-12">Загрузка...</div>}>
                <RegisterPage />
              </Suspense>
            }
          />
          <Route
            path="anime/:id"
            element={
              <Suspense fallback={<div className="text-center py-12">Загрузка...</div>}>
                <AnimeDetailPage />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<div className="text-center py-12">Загрузка...</div>}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="profile/anime"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div className="text-center py-12">Загрузка...</div>}>
                  <UserAnimeListPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
