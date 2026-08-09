import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { listUserProgressByUser } from '@/lib/db';
import { tallyMasteryCounts, type MasteryCounts } from '@/lib/dashboard';
import type { LearningItem } from '@/types/learningItem';

/** Mastery-tier breakdown (New/Learning/Familiar/Mastered) for a given set of
 * items, e.g. everything currently shown on a browse page. `null` while loading. */
export function useItemMasteryCounts(items: LearningItem[]): MasteryCounts | null {
  const { user } = useAuth();
  const [counts, setCounts] = useState<MasteryCounts | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void listUserProgressByUser(user.id).then((progress) => {
      if (cancelled) {
        return;
      }

      const progressByItemId = new Map(progress.map((entry) => [entry.itemId, entry]));
      setCounts(tallyMasteryCounts(items, progressByItemId));
    });

    return () => {
      cancelled = true;
    };
  }, [user, items]);

  return counts;
}
