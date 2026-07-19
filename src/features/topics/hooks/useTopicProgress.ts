import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loadTopicProgressForUser } from '@/features/topics/topicProgressService';
import type { TopicProgress } from '@/types/topicProgress';

export function useTopicProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TopicProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((current) => current + 1);
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
        const result = await loadTopicProgressForUser(user.id);
        if (!cancelled) {
          setProgress(result);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load topic progress');
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

  const progressByTopicId = useMemo(
    () => new Map(progress.map((entry) => [entry.topicId, entry])),
    [progress],
  );

  return {
    progress: user ? progress : [],
    progressByTopicId,
    isLoading: user ? isLoading : false,
    error: user ? error : null,
    reload,
  };
}
