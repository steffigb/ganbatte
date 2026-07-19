import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ReviewQueueEntry, ReviewSessionStats } from '@/features/review/reviewService';
import {
  buildReviewQueue,
  gradeReview,
} from '@/features/review/reviewService';
import { ensureSyncMeta } from '@/lib/db/deviceId';
import type { LearningItem } from '@/types/learningItem';
import type { ReviewGrade } from '@/types/review';

export type ReviewSessionState = {
  queue: ReviewQueueEntry[];
  currentIndex: number;
  currentEntry: ReviewQueueEntry | null;
  isRevealed: boolean;
  isLoading: boolean;
  isGrading: boolean;
  error: string | null;
  isComplete: boolean;
  stats: ReviewSessionStats;
  reveal: () => void;
  grade: (grade: ReviewGrade) => Promise<void>;
  reload: () => void;
};

const INITIAL_STATS: ReviewSessionStats = {
  reviewed: 0,
  againCount: 0,
};

export function useReviewSession(): ReviewSessionState {
  const { user } = useAuth();
  const [queue, setQueue] = useState<ReviewQueueEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState<ReviewSessionStats>(INITIAL_STATS);
  const [refreshKey, setRefreshKey] = useState(0);
  const cardShownAtRef = useRef(0);

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
      setIsRevealed(false);
      setStats(INITIAL_STATS);

      try {
        await ensureSyncMeta();
        const nextQueue = await buildReviewQueue(user.id);

        if (cancelled) {
          return;
        }

        setQueue(nextQueue);
        setIsComplete(nextQueue.length === 0);
        cardShownAtRef.current = Date.now();
      } catch (cause) {
        if (!cancelled) {
          const message = cause instanceof Error ? cause.message : 'Failed to load review queue';
          setError(message);
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

  const currentEntry = queue[currentIndex] ?? null;

  const reveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const grade = useCallback(
    async (gradeValue: ReviewGrade) => {
      if (!user || !currentEntry || isGrading) {
        return;
      }

      setIsGrading(true);
      setError(null);

      const responseTimeMs = Date.now() - cardShownAtRef.current;
      const item: LearningItem = currentEntry.item;

      try {
        await gradeReview(
          user.id,
          item,
          currentEntry.progress,
          gradeValue,
          responseTimeMs,
        );

        setStats((previous) => ({
          reviewed: previous.reviewed + 1,
          againCount: previous.againCount + (gradeValue < 3 ? 1 : 0),
        }));

        const nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length) {
          setIsComplete(true);
        } else {
          setCurrentIndex(nextIndex);
          setIsRevealed(false);
          cardShownAtRef.current = Date.now();
        }
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Failed to save review';
        setError(message);
      } finally {
        setIsGrading(false);
      }
    },
    [user, currentEntry, isGrading, currentIndex, queue.length],
  );

  return useMemo(
    () => ({
      queue,
      currentIndex,
      currentEntry,
      isRevealed,
      isLoading,
      isGrading,
      error,
      isComplete,
      stats,
      reveal,
      grade,
      reload,
    }),
    [
      queue,
      currentIndex,
      currentEntry,
      isRevealed,
      isLoading,
      isGrading,
      error,
      isComplete,
      stats,
      reveal,
      grade,
      reload,
    ],
  );
}
