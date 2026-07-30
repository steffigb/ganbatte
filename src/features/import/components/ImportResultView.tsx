import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ImportResult } from '@/lib/import/types';

type ImportResultViewProps = {
  result: ImportResult;
  onStartOver: () => void;
};

export function ImportResultView({ result, onStartOver }: ImportResultViewProps) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-4">
      <FormAlert
        variant="success"
        message={`Import complete — ${result.importedCount} items, ${result.updatedCount} updated, ${result.attachedCount} attached, ${result.skippedCount} skipped.`}
      />

      {hasErrors ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {result.errorCount} row issue(s)
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-300">
            {result.errors.slice(0, 20).map((error) => (
              <li key={`${error.row}-${error.message}`}>
                Row {error.row}: {error.message}
              </li>
            ))}
          </ul>
          {result.errors.length > 20 ? (
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
              …and {result.errors.length - 20} more
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Changes are saved locally. Use <strong>Sync now</strong> in the header to push to Supabase.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          to={routes.learn('kanji')}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          Browse kanji
        </Link>
        <Link
          to={routes.topics}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          View topics
        </Link>
        <Button type="button" onClick={onStartOver}>
          Import another file
        </Button>
      </div>
    </div>
  );
}
