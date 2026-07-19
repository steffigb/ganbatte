import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  defaultSearchFilters,
  searchAll,
  type SearchFilters,
  type SearchResults,
} from '@/features/search/searchService';
import { emptySearchResults } from '@/lib/search';

const SEARCH_DEBOUNCE_MS = 200;

export function useSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [results, setResults] = useState<SearchResults>(emptySearchResults());
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedDebouncedQuery = debouncedQuery.trim();
  const canSearch = Boolean(user && trimmedDebouncedQuery);

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultSearchFilters);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!canSearch || !user) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsSearching(true);
      setError(null);

      try {
        const nextResults = await searchAll(user.id, trimmedDebouncedQuery, filters);
        if (!cancelled) {
          setResults(nextResults);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Search failed');
          setResults(emptySearchResults());
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, canSearch, trimmedDebouncedQuery, filters]);

  const visibleResults = useMemo(
    () => (canSearch ? results : emptySearchResults()),
    [canSearch, results],
  );

  return {
    query,
    setQuery,
    filters,
    updateFilter,
    resetFilters,
    results: visibleResults,
    isSearching: canSearch && isSearching,
    error: canSearch ? error : null,
    hasQuery: trimmedDebouncedQuery.length > 0,
  };
}
