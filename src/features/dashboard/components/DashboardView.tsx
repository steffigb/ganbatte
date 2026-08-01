import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SkillReadiness } from '@/features/dashboard/components/SkillReadiness';
import { WeakTopicsList } from '@/features/dashboard/components/WeakTopicsList';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';

function formatExamDate(examDate: string): string {
  return new Date(examDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DashboardView() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard…" />;
  }

  if (error) {
    return <FormAlert variant="error" message={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Days until exam
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {data.daysUntilExam}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {formatExamDate(data.examDate)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Overall readiness
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {data.overallReadiness}%
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Weighted across all five skills
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Study today
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {data.queueSize}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {data.dueCount} due · includes weak-topic and N5 recap cards
          </p>
          <Link to={routes.study} className="mt-3 inline-block">
            <Button type="button">Start session</Button>
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            New lessons today
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {data.lessonsAvailableToday}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Learn new items before they enter reviews
          </p>
          <Link to={routes.learnHub} className="mt-3 inline-block">
            <Button type="button">Go to Learn</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkillReadiness skillReadiness={data.skillReadiness} />
        <WeakTopicsList weakTopics={data.weakTopics} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Reading &amp; listening minutes this week
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {data.readingListeningMinutesThisWeek}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Not counted by SRS readiness — logged from item detail pages and the Learn hub.
        </p>
      </div>
    </div>
  );
}
