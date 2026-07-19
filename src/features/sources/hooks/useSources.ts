import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  deleteSource,
  ensureSyncMeta,
  listSourcesByUser,
  upsertSource,
} from '@/lib/db';
import type { Source, SourceType } from '@/types/source';
import { nowIso } from '@/utils/date';

export type CreateSourceInput = {
  label: string;
  type?: SourceType;
  notes?: string;
};

export function useSources() {
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
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
        const result = await listSourcesByUser(user.id);
        if (!cancelled) {
          setSources(result);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load sources');
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

  const createSource = useCallback(
    async (input: CreateSourceInput) => {
      if (!user) {
        throw new Error('You must be signed in to create sources');
      }

      const timestamp = nowIso();
      await upsertSource({
        id: crypto.randomUUID(),
        userId: user.id,
        label: input.label.trim(),
        type: input.type,
        notes: input.notes?.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      reload();
    },
    [user, reload],
  );

  const removeSource = useCallback(
    async (id: string) => {
      await deleteSource(id);
      reload();
    },
    [reload],
  );

  return {
    sources: user ? sources : [],
    isLoading: user ? isLoading : false,
    error: user ? error : null,
    createSource,
    removeSource,
    reload,
  };
}
