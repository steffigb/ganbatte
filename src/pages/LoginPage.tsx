import { Navigate, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';
import { LoginForm } from '@/features/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function LoginPage() {
  const { user, isLoading, isConfigured } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? routes.dashboard;

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <PageLayout title="Login" description="Sign in to sync your learning data.">
          <PlaceholderCard>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to
            your <code>.env</code> file.
          </PlaceholderCard>
        </PageLayout>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Checking session…" />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageLayout title="Login" description="Sign in to sync your learning data across devices.">
        <div className="rounded-xl border border-green-200 bg-white p-6 dark:border-green-700 dark:bg-green-900">
          <LoginForm />
        </div>
      </PageLayout>
    </div>
  );
}
