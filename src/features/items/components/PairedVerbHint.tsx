import { useEffect, useState } from 'react';
import { findPairedItem } from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import { formatItemMeaning } from '@/utils/meaningText';

type PairedVerbHintProps = {
  userId: string;
  item: LearningItem;
};

export function PairedVerbHint({ userId, item }: PairedVerbHintProps) {
  const [pairedItem, setPairedItem] = useState<LearningItem | undefined>();

  useEffect(() => {
    let cancelled = false;

    void findPairedItem(userId, item).then((result) => {
      if (!cancelled) {
        setPairedItem(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, item]);

  if (!pairedItem) {
    return null;
  }

  return (
    <div className="rounded-lg bg-green-50 p-3 text-sm dark:bg-green-800">
      <p className="text-xs uppercase tracking-wide text-green-700 dark:text-green-400">
        Paired verb
      </p>
      <p className="mt-1 text-green-950 dark:text-green-100">{pairedItem.japanese}</p>
      {pairedItem.reading ? (
        <p className="mt-1 text-green-700 dark:text-green-400">{pairedItem.reading}</p>
      ) : null}
      <p className="mt-1 text-green-700 dark:text-green-300">
        {formatItemMeaning(pairedItem.meaning, pairedItem.meaningAlt)}
      </p>
    </div>
  );
}
