import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Source } from '@/types/source';

type SourceListProps = {
  sources: Source[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
};

export function SourceList({ sources, isLoading, error, onDelete }: SourceListProps) {
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

  if (sources.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        No sources yet. Add textbooks, decks, or other materials you study from.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {sources.map((source) => (
        <li
          key={source.id}
          className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
        >
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{source.label}</p>
            {source.type ? (
              <p className="text-slate-500 dark:text-slate-400">{source.type}</p>
            ) : null}
          </div>
          <Button
            type="button"
            className="shrink-0 bg-red-700 hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
            onClick={() => void onDelete(source.id)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
