import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SearchResultGroupView } from '@/features/search/components/SearchResultGroupView';
import { flattenSearchResults, hasSearchResults, type SearchResults } from '@/lib/search';

type SearchResultsViewProps = {
  results: SearchResults;
  isSearching: boolean;
  error: string | null;
};

export function SearchResultsView({
  results,
  isSearching,
  error,
}: SearchResultsViewProps) {
  if (isSearching) {
    return <LoadingSpinner label="Searching…" />;
  }

  if (error) {
    return <FormAlert variant="error" message={error} />;
  }

  if (!hasSearchResults(results)) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-green-300 p-4 text-sm text-green-700 dark:border-green-700 dark:text-green-400">
        <p>No matches found. Try a shorter query or reset your filters.</p>
        <Link to={routes.add} className="font-medium text-green-800 underline dark:text-green-300">
          Create new item
        </Link>
      </div>
    );
  }

  const groups = flattenSearchResults(results);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <SearchResultGroupView
          key={group.key}
          group={group}
          className={group.key === 'topics' ? 'sm:col-span-2' : undefined}
        />
      ))}

      <div className="rounded-xl border border-green-200 bg-white p-4 text-sm dark:border-green-800 dark:bg-green-900 sm:col-span-2">
        <p className="text-green-700 dark:text-green-400">
          Didn&apos;t find what you need?
        </p>
        <Link
          to={routes.add}
          className="mt-2 inline-block font-medium text-green-800 underline dark:text-green-300"
        >
          Create new item
        </Link>
      </div>
    </div>
  );
}
