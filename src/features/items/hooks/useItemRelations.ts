import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loadItemRelationsByUser, type ItemRelations } from '@/features/items/itemDetailService';

/** Topics/sources for every item the user has, keyed by item id — for list
 * views (e.g. the browse overview) that need this per row without issuing a
 * query per item. `null` while loading. */
export function useItemRelations(): Map<string, ItemRelations> | null {
  const { user } = useAuth();
  const [relations, setRelations] = useState<Map<string, ItemRelations> | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void loadItemRelationsByUser(user.id).then((result) => {
      if (!cancelled) {
        setRelations(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return relations;
}
