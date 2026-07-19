import { PageLayout } from '@/components/layout/PageLayout';
import { SearchView } from '@/features/search';

export function SearchPage() {
  return (
    <PageLayout
      title="Search"
      description="Find vocabulary, kanji, grammar patterns, and topics."
    >
      <SearchView />
    </PageLayout>
  );
}
