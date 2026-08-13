import { SearchBar } from '@/features/search/components/SearchBar';
import { SearchFiltersPanel } from '@/features/search/components/SearchFiltersPanel';
import { SearchResultsView } from '@/features/search/components/SearchResultsView';
import { useSearch } from '@/features/search/hooks/useSearch';

export function SearchView() {
  const {
    query,
    setQuery,
    filters,
    updateFilter,
    resetFilters,
    results,
    isSearching,
    error,
  } = useSearch();

  return (
    <div className="space-y-4">
      <SearchBar query={query} onQueryChange={setQuery} />
      <SearchFiltersPanel
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />
      <SearchResultsView results={results} isSearching={isSearching} error={error} />
    </div>
  );
}
