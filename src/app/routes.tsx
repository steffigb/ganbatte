import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RequireAuth } from '@/features/auth';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const StudyTodayPage = lazy(() =>
  import('@/pages/StudyTodayPage').then((m) => ({ default: m.StudyTodayPage })),
);
const LearnBrowsePage = lazy(() =>
  import('@/pages/LearnBrowsePage').then((m) => ({ default: m.LearnBrowsePage })),
);
const TopicsPage = lazy(() =>
  import('@/pages/TopicsPage').then((m) => ({ default: m.TopicsPage })),
);
const AddItemPage = lazy(() =>
  import('@/pages/AddItemPage').then((m) => ({ default: m.AddItemPage })),
);
const BulkImportPage = lazy(() =>
  import('@/pages/BulkImportPage').then((m) => ({ default: m.BulkImportPage })),
);
const SearchPage = lazy(() =>
  import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<LazyPage><DashboardPage /></LazyPage>} />
          <Route path="study" element={<LazyPage><StudyTodayPage /></LazyPage>} />
          <Route path="learn/:skill" element={<LazyPage><LearnBrowsePage /></LazyPage>} />
          <Route path="topics" element={<LazyPage><TopicsPage /></LazyPage>} />
          <Route path="add" element={<LazyPage><AddItemPage /></LazyPage>} />
          <Route path="import" element={<LazyPage><BulkImportPage /></LazyPage>} />
          <Route path="search" element={<LazyPage><SearchPage /></LazyPage>} />
          <Route path="settings" element={<LazyPage><SettingsPage /></LazyPage>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
