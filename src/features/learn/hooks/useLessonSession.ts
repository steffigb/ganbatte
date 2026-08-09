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
  back: () => void;
  finish: () => Promise<void>;
  reload: () => void;
};

/** Remembers which item you were on within a lesson session, per group, so
 * stepping away (e.g. to look up a word) and coming back — which unmounts and
 * remounts this page — doesn't restart the session from the beginning.
 * sessionStorage: resets on tab/window close, doesn't linger across days. */
function positionStorageKey(group: LessonGroup): string {
  return `ganbatte:lesson-position:${group}`;
}

function readSavedItemId(group: LessonGroup): string | null {
  try {
    return sessionStorage.getItem(positionStorageKey(group));
  } catch {
    return null;
  }
}

function saveItemId(group: LessonGroup, itemId: string | null): void {
  try {
    if (itemId) {
      sessionStorage.setItem(positionStorageKey(group), itemId);
    } else {
      sessionStorage.removeItem(positionStorageKey(group));
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — resume just won't work
  }
}

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

      try {
        const batch = await buildLessonBatch(user.id, group);
        if (cancelled) {
          return;
        }

        const savedItemId = readSavedItemId(group);
        const restoredIndex = savedItemId
          ? batch.entries.findIndex((entry) => entry.item.id === savedItemId)
          : -1;

        setEntries(batch.entries);
        setCurrentIndex(restoredIndex >= 0 ? restoredIndex : 0);
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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    saveItemId(group, currentEntry?.item.id ?? null);
  }, [group, currentEntry, isLoading]);

  const next = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, entries.length));
  }, [entries.length]);

  const back = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

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
      saveItemId(group, null);
      setIsComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save lessons');
    } finally {
      setIsSaving(false);
    }
  }, [user, group, entries, isSaving]);

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
      back,
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
      back,
      finish,
      reload,
    ],
  );
}
