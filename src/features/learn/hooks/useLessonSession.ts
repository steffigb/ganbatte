import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  buildLessonBatch,
  completeLessons,
  type LessonGroup,
  type LessonQueueEntry,
} from '@/features/learn/lessonService';

export type LessonSessionState = {
  entries: LessonQueueEntry[];
  currentIndex: number;
  currentEntry: LessonQueueEntry | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isComplete: boolean;
  learnedCount: number;
  remainingToday: number;
  next: () => void;
  finish: () => Promise<void>;
  reload: () => void;
};

export function useLessonSession(group: LessonGroup): LessonSessionState {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LessonQueueEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [remainingToday, setRemainingToday] = useState(0);
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
      setIsComplete(false);
      setCurrentIndex(0);

      try {
        const batch = await buildLessonBatch(user.id, group);
        if (cancelled) {
          return;
        }

        setEntries(batch.entries);
        setRemainingToday(batch.remainingToday);
        setIsComplete(batch.entries.length === 0);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load lessons');
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
  }, [user, group, refreshKey]);

  const currentEntry = entries[currentIndex] ?? null;

  const next = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, entries.length));
  }, [entries.length]);

  const finish = useCallback(async () => {
    if (!user || entries.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await completeLessons(
        user.id,
        entries.map((entry) => entry.item),
      );
      setIsComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save lessons');
    } finally {
      setIsSaving(false);
    }
  }, [user, entries, isSaving]);

  return useMemo(
    () => ({
      entries,
      currentIndex,
      currentEntry,
      isLoading,
      isSaving,
      error,
      isComplete,
      learnedCount: entries.length,
      remainingToday,
      next,
      finish,
      reload,
    }),
    [
      entries,
      currentIndex,
      currentEntry,
      isLoading,
      isSaving,
      error,
      isComplete,
      remainingToday,
      next,
      finish,
      reload,
    ],
  );
}
