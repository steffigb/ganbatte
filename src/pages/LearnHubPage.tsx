import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LearnHubCardView, useLearnHub } from '@/features/learn';

export function LearnHubPage() {
  const { cards, isLoading, error } = useLearnHub();

  return (
    <PageLayout
      title="Learn"
      description="Start lessons to see new items, or jump into reviews for what's due."
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <LearnHubCardView key={card.group} card={card} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
