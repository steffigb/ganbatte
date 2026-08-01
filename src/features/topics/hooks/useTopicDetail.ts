import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getTopicById, listItemsByTopic, softDeleteItem } from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import type { Topic } from '@/types/topic';

export function useTopicDetail(topicId: string | undefined) {
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | undefined>(undefined);
  const [items, setItems] = useState<LearningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!user || !topicId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [foundTopic, foundItems] = await Promise.all([
          getTopicById(topicId),
          listItemsByTopic(topicId),
        ]);

        if (!cancelled) {
          setTopic(foundTopic);
          setItems(foundItems.sort((a, b) => a.japanese.localeCompare(b.japanese, 'ja')));
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load topic');
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
  }, [user, topicId, refreshKey]);

  const removeItem = useCallback(
    async (id: string) => {
      await softDeleteItem(id);
      reload();
    },
    [reload],
  );

  return {
    topic,
    items: user ? items : [],
    isLoading: user ? isLoading : false,
    error: user ? error : null,
    removeItem,
    reload,
  };
}
