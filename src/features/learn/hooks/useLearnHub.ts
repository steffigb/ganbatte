import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loadLearnHubCards, type LearnHubCard } from '@/features/learn/learnHubService';

export function useLearnHub() {
  const { user } = useAuth();
  const [cards, setCards] = useState<LearnHubCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loadLearnHubCards(user.id);
        if (!cancelled) {
          setCards(result);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load Learn overview');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  return {
    cards: user ? cards : [],
    isLoading: user ? isLoading : false,
    error: user ? error : null,
    reload,
  };
}
