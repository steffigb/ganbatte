import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import type { ReviewSessionStats } from '@/features/review/reviewService';

type ReviewCompleteProps = {
  stats: ReviewSessionStats;
  onRestart: () => void;
};

export function ReviewComplete({ stats, onRestart }: ReviewCompleteProps) {
  const passed = stats.reviewed - stats.againCount;

  return (
    <div className="space-y-4 rounded-xl border border-green-200 bg-white p-6 text-center dark:border-green-800 dark:bg-green-900">
      <h2 className="text-lg font-semibold text-green-950 dark:text-green-100">Session complete</h2>
      <p className="text-sm text-green-700 dark:text-green-400">
        Reviewed {stats.reviewed} card{stats.reviewed === 1 ? '' : 's'} · {passed} recalled ·{' '}
        {stats.againCount} again
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onRestart}>
          Study again
        </Button>
        <Link
          to={routes.dashboard}
          className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
