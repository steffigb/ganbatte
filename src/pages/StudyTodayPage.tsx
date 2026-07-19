import { PageLayout } from '@/components/layout/PageLayout';
import { ReviewSession } from '@/features/review';

export function StudyTodayPage() {
  return (
    <PageLayout
      title="Study today"
      description="SRS due cards, weak-topic boost, and N5 recap."
    >
      <ReviewSession />
    </PageLayout>
  );
}
