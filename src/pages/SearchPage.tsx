import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';

export function SearchPage() {
  return (
    <PageLayout
      title="Search"
      description="Find vocabulary, kanji, grammar patterns, and topics."
    >
      <PlaceholderCard>Global search will query local IndexedDB first.</PlaceholderCard>
    </PageLayout>
  );
}
