import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function SettingsPage() {
  return (
    <PageLayout title="Settings" description="Exam date, daily goals, sync, and backup.">
      <PlaceholderCard>
        <p>Supabase: {isSupabaseConfigured() ? 'configured' : 'missing env vars'}</p>
        <p className="mt-2">Auth, sync, and export settings will be added here.</p>
      </PlaceholderCard>
    </PageLayout>
  );
}
