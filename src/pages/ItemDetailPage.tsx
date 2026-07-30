import { useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/features/auth';
import { ItemDetailView } from '@/features/items/components/ItemDetailView';
import { useItemDetail } from '@/features/items/hooks/useItemDetail';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { detail, isLoading, error } = useItemDetail(id);

  return (
    <PageLayout title="Item detail">
      {isLoading ? <LoadingSpinner /> : null}
      {error ? <FormAlert variant="error" message={error} /> : null}
      {!isLoading && !error && detail && user ? (
        <ItemDetailView detail={detail} userId={user.id} />
      ) : null}
    </PageLayout>
  );
}
