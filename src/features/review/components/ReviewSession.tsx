import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ReviewActions } from '@/features/review/components/ReviewActions';
import { ReviewCard } from '@/features/review/components/ReviewCard';
import { ReviewComplete } from '@/features/review/components/ReviewComplete';
import { ReviewProgress } from '@/features/review/components/ReviewProgress';
import { useReviewSession } from '@/features/review/hooks/useReviewSession';

export function ReviewSession() {
  const session = useReviewSession();

  if (session.isLoading) {
    return <LoadingSpinner label="Loading review queue…" />;
  }

  if (session.error && !session.currentEntry && !session.isComplete) {
    return <FormAlert variant="error" message={session.error} />;
  }

  if (session.isComplete) {
    if (session.queue.length === 0) {
      return (
        <div className="space-y-4 rounded-xl border border-dashed border-green-300 p-6 text-center dark:border-green-700">
          <p className="text-sm text-green-700 dark:text-green-400">
            No cards due right now. Add vocabulary, kanji, or grammar items to start reviewing.
          </p>
          <Link
            to={routes.add}
            className="inline-block rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 dark:bg-green-100 dark:text-green-900 dark:hover:bg-green-200"
          >
            Add items
          </Link>
        </div>
      );
    }

    return <ReviewComplete stats={session.stats} onRestart={session.reload} />;
  }

  if (!session.currentEntry) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ReviewProgress current={session.currentIndex} total={session.queue.length} />

      <ReviewCard
        item={session.currentEntry.item}
        isRevealed={session.isRevealed}
        onReveal={session.reveal}
      />

      <ReviewActions
        visible={session.isRevealed}
        disabled={session.isGrading}
        onGrade={(grade) => void session.grade(grade)}
      />

      {session.error ? <FormAlert variant="error" message={session.error} /> : null}
    </div>
  );
}
