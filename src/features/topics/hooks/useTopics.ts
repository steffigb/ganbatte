import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  ensureSyncMeta,
  listTopicsByUser,
  softDeleteTopic,
  upsertTopic,
} from '@/lib/db';
import type { JlptLevel, Skill } from '@/types/domain';
import type { Topic } from '@/types/topic';
import { nowIso } from '@/utils/date';

export type CreateTopicInput = {
  level: JlptLevel;
  skill: Skill;
  name: string;
  description?: string;
};

export function useTopics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
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
        await ensureSyncMeta();
        const result = await listTopicsByUser(user.id);
        if (!cancelled) {
          setTopics(result);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load topics');
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

  const createTopic = useCallback(
    async (input: CreateTopicInput) => {
      if (!user) {
        throw new Error('You must be signed in to create topics');
      }

      const timestamp = nowIso();
      await upsertTopic({
        id: crypto.randomUUID(),
        userId: user.id,
        level: input.level,
        skill: input.skill,
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      reload();
    },
    [user, reload],
  );

  const removeTopic = useCallback(
    async (id: string) => {
      await softDeleteTopic(id);
      reload();
    },
    [reload],
  );

  return {
    topics: user ? topics : [],
    isLoading: user ? isLoading : false,
    error: user ? error : null,
    createTopic,
    removeTopic,
    reload,
  };
}
