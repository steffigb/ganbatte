import { Button } from '@/components/ui/Button';
import { ReviewCard } from '@/features/review/components/ReviewCard';
import { ReviewProgress } from '@/features/review/components/ReviewProgress';
import { usePracticeSession } from '@/features/practice/hooks/usePracticeSession';
import type { LearningItem } from '@/types/learningItem';

type PracticeSessionProps = {
  items: LearningItem[];
  onExit: () => void;
};

export function PracticeSession({ items, onExit }: PracticeSessionProps) {
  const session = usePracticeSession(items);

  if (session.isComplete) {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Practice complete
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {session.stats.correct} / {session.stats.reviewed} correct — this session doesn&apos;t
          affect your spaced-repetition schedule.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={session.restart}>
            Practice again
          </Button>
          <Button
            type="button"
            className="border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={onExit}
          >
            Change filters
          </Button>
        </div>
      </div>
    );
  }

  if (!session.currentItem) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ReviewProgress current={session.currentIndex} total={session.total} />

      <ReviewCard item={session.currentItem} isRevealed={session.isRevealed} onReveal={session.reveal} />

      <div className="flex justify-center gap-2">
        {!session.isRevealed ? null : (
          <>
            <Button
              type="button"
              className="bg-red-700 hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
              onClick={() => session.mark(false)}
            >
              Forgot it
            </Button>
            <Button
              type="button"
              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700"
              onClick={() => session.mark(true)}
            >
              Knew it
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
