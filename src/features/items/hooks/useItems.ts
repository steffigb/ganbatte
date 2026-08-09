import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  ensureSyncMeta,
  listItemsBySkill,
  listItemsBySkillAnyLevel,
  listItemsByUser,
  softDeleteItem,
} from '@/lib/db';
import type { JlptLevel, Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';

export type LevelFilter = 'all' | JlptLevel;

type UseItemsOptions = {
  skill?: Skill;
  level?: LevelFilter;
};

export function useItems(options: UseItemsOptions = {}) {
  const { user } = useAuth();
  const [items, setItems] = useState<LearningItem[]>([]);
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

        let result: LearningItem[];
        if (options.skill && options.level && options.level !== 'all') {
          result = await listItemsBySkill(user.id, options.level, options.skill);
        } else if (options.skill) {
          result = await listItemsBySkillAnyLevel(user.id, options.skill);
        } else {
          result = await listItemsByUser(user.id);
        }

        if (!cancelled) {
          setItems(
            result.sort((a, b) => a.japanese.localeCompare(b.japanese, 'ja')),
          );
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load items');
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
  }, [user, options.skill, options.level, refreshKey]);

  const removeItem = useCallback(
    async (id: string) => {
      try {
        await softDeleteItem(id);
        reload();
      } catch (cause) {
        throw cause instanceof Error ? cause : new Error('Failed to delete item');
      }
    },
    [reload],
  );

  return {
    items: user ? items : [],
    isLoading: user ? isLoading : false,
    error: user ? error : null,
    removeItem,
    reload,
  };
}
