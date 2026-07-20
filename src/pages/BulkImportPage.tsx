import { PageLayout } from '@/components/layout/PageLayout';
import { ImportView } from '@/features/import';

export function BulkImportPage() {
  return (
    <PageLayout
      title="Bulk import"
      description="Import CSV with preview, duplicate handling, and kanji reading status support."
    >
      <ImportView />
    </PageLayout>
  );
}
