import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';

export function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      description="JLPT N4 readiness, weak topics, and study overview."
    >
      <PlaceholderCard>
        <p>Dashboard widgets will show days until the exam and skill readiness.</p>
        <Link
          to={routes.study}
          className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Start study today
        </Link>
      </PlaceholderCard>
    </PageLayout>
  );
}
