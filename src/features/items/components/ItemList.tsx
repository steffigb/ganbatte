import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { LearningItem } from '@/types/learningItem';

type ItemListProps = {
  items: LearningItem[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
};

export function ItemList({ items, isLoading, error, onDelete }: ItemListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        No items yet.{' '}
        <Link to={routes.add} className="underline">
          Add your first item
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {item.japanese}
              {item.reading ? (
                <span className="ml-2 font-normal text-slate-500">({item.reading})</span>
              ) : null}
            </p>
            <p className="text-slate-600 dark:text-slate-400">{item.meaning}</p>
            <p className="text-slate-500 dark:text-slate-500">
              {item.level} · {item.type}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              to={`${routes.add}?edit=${item.id}`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Edit
            </Link>
            <Button
              type="button"
              className="bg-red-700 hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
              onClick={() => void onDelete(item.id)}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
