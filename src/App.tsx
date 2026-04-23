import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
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
    return <div className="text-center py-12">Загрузка...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="anime/:id" element={<AnimeDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="profile/anime"
          element={
            <ProtectedRoute>
              <UserAnimeListPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
