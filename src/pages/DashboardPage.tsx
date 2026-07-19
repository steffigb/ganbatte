import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardView } from '@/features/dashboard';

export function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      description="JLPT N4 readiness, weak topics, and study overview."
    >
      <DashboardView />
    </PageLayout>
  );
}
