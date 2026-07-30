import { useEffect, useState } from 'react';
import { loadItemDetail, type ItemDetail } from '@/features/items/itemDetailService';

export function useItemDetail(itemId: string | undefined) {
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(itemId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loadItemDetail(itemId);
        if (cancelled) {
          return;
        }

        if (!result) {
          setError('Item not found');
          setDetail(null);
          return;
        }

        setDetail(result);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load item');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return { detail, isLoading, error };
}
