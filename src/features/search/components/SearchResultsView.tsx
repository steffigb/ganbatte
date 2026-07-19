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
  hasQuery: boolean;
};

export function SearchResultsView({
  results,
  isSearching,
  error,
  hasQuery,
}: SearchResultsViewProps) {
  if (!hasQuery) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        Start typing to search vocabulary, kanji, grammar, topics, tags, and sources.
      </p>
    );
  }

  if (isSearching) {
    return <LoadingSpinner label="Searching…" />;
  }

  if (error) {
    return <FormAlert variant="error" message={error} />;
  }

  if (!hasSearchResults(results)) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        <p>No matches found. Try a shorter query or reset your filters.</p>
        <Link to={routes.add} className="font-medium text-slate-700 underline dark:text-slate-300">
          Create new item
        </Link>
      </div>
    );
  }

  const groups = flattenSearchResults(results);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <SearchResultGroupView key={group.key} group={group} />
      ))}

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          Didn&apos;t find what you need?
        </p>
        <Link
          to={routes.add}
          className="mt-2 inline-block font-medium text-slate-700 underline dark:text-slate-300"
        >
          Create new item
        </Link>
      </div>
    </div>
  );
}
