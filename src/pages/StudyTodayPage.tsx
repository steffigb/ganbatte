import { PageLayout } from '@/components/layout/PageLayout';
import { ReviewSession } from '@/features/review';

export function StudyTodayPage() {
  return (
    <PageLayout
      title="Study today"
      description="Review due vocabulary, kanji, and grammar with spaced repetition."
    >
      <ReviewSession />
    </PageLayout>
  );
}
