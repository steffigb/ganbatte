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
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Session complete</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Reviewed {stats.reviewed} card{stats.reviewed === 1 ? '' : 's'} · {passed} recalled ·{' '}
        {stats.againCount} again
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onRestart}>
          Study again
        </Button>
        <Link
          to={routes.dashboard}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
