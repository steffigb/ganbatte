import { useCallback, useMemo, useState } from 'react';
import type { LearningItem } from '@/types/learningItem';

export type PracticeStats = {
  reviewed: number;
  correct: number;
};

export function usePracticeSession(items: LearningItem[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [stats, setStats] = useState<PracticeStats>({ reviewed: 0, correct: 0 });

  const currentItem = items[currentIndex] ?? null;
  const isComplete = items.length > 0 && currentIndex >= items.length;

  const reveal = useCallback(() => setIsRevealed(true), []);

  const mark = useCallback((wasCorrect: boolean) => {
    setStats((previous) => ({
      reviewed: previous.reviewed + 1,
      correct: previous.correct + (wasCorrect ? 1 : 0),
    }));
    setCurrentIndex((index) => index + 1);
    setIsRevealed(false);
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setStats({ reviewed: 0, correct: 0 });
  }, []);

  return useMemo(
    () => ({
      currentItem,
      currentIndex,
      total: items.length,
      isRevealed,
      isComplete,
      stats,
      reveal,
      mark,
      restart,
    }),
    [currentItem, currentIndex, items.length, isRevealed, isComplete, stats, reveal, mark, restart],
  );
}
