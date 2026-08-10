import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ReviewCard } from '@/features/review/components/ReviewCard';
import { ReviewProgress } from '@/features/review/components/ReviewProgress';
import type { LessonGroup } from '@/features/learn/lessonService';
import { useLessonSession } from '@/features/learn/hooks/useLessonSession';
import { LessonSetup } from '@/features/learn/components/LessonSetup';

type LessonSessionProps = {
  group: LessonGroup;
};

export function LessonSession({ group }: LessonSessionProps) {
  const session = useLessonSession(group);

  if (session.isLoading) {
    return <LoadingSpinner label="Loading lessons…" />;
  }

  if (session.phase === 'setup') {
    return <LessonSetup session={session} />;
  }

  if (session.phase === 'complete') {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Lesson complete
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Learned {session.entries.length} new item{session.entries.length === 1 ? '' : 's'}. They
          are now in your review queue.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to={routes.study}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Start reviews
          </Link>
          <button
            type="button"
            onClick={session.backToSetup}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Learn more
          </button>
          <Link
            to={routes.learnHub}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Back to Learn
          </Link>
        </div>
      </div>
    );
  }

  if (!session.currentEntry) {
    return null;
  }

  const isLast = session.currentIndex === session.entries.length - 1;

  return (
    <div className="space-y-4">
      <ReviewProgress current={session.currentIndex} total={session.entries.length} />

      <ReviewCard item={session.currentEntry.item} isRevealed onReveal={() => undefined} />

      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={session.currentIndex === 0}
          onClick={session.back}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Back
        </button>
        {isLast ? (
          <Button type="button" disabled={session.isSaving} onClick={() => void session.finish()}>
            Finish lesson
          </Button>
        ) : (
          <Button type="button" onClick={session.next}>
            Next
          </Button>
        )}
      </div>

      {session.error ? <FormAlert variant="error" message={session.error} /> : null}
    </div>
  );
}
