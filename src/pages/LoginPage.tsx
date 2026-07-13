import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function LoginPage() {
  return (
    <PageLayout title="Login" description="Sign in to sync your learning data.">
      <PlaceholderCard>
        {isSupabaseConfigured()
          ? 'Login form will connect to Supabase Auth.'
          : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.'}
      </PlaceholderCard>
    </PageLayout>
  );
}
