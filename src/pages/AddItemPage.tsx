import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ItemForm, useItemForm } from '@/features/items';

export function AddItemPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') ?? undefined;
  const isEditing = Boolean(editId);
  const formState = useItemForm(editId);

  return (
    <PageLayout
      title={isEditing ? 'Edit item' : 'Add item'}
      description="Create a single vocabulary, kanji, or grammar entry."
    >
      <ItemForm editId={editId} {...formState} />
    </PageLayout>
  );
}
