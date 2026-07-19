import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function SettingsPage() {
  const { user, session } = useAuth();

  return (
    <PageLayout title="Settings" description="Exam date, daily goals, sync, and backup.">
      <div className="space-y-4">
        <PlaceholderCard>
          <p>
            Signed in as <strong>{user?.email ?? 'unknown'}</strong>
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Session expires:{' '}
            {session?.expires_at
              ? new Date(session.expires_at * 1000).toLocaleString('de-DE')
              : '—'}
          </p>
        </PlaceholderCard>
        <PlaceholderCard>
          Exam date, sync, and export settings will be added here.
        </PlaceholderCard>
      </div>
    </PageLayout>
  );
}
