import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function RequireAuth() {
  const { user, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-slate-600 dark:text-slate-400">
        Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code>.env</code> file.
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Checking session…" />;
  }

  if (!user) {
    return <Navigate to={routes.login} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
