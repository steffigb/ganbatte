import { useEffect, useState } from 'react';
import { listItemExamplesByItem } from '@/lib/db';
import type { ItemExample } from '@/types/itemExample';
import { normalizeMeaningText } from '@/utils/meaningText';

type ItemExamplesListProps = {
  itemId: string;
  fallbackExample?: string;
  fallbackExampleReading?: string;
};

function ExampleBlock({
  example,
  exampleReading,
  exampleMeaning,
}: {
  example: string;
  exampleReading?: string;
  exampleMeaning?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
      <p className="text-slate-900 dark:text-slate-100">{example}</p>
      {exampleReading ? (
        <p className="mt-1 text-slate-500 dark:text-slate-400">{exampleReading}</p>
      ) : null}
      {exampleMeaning ? (
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          {normalizeMeaningText(exampleMeaning)}
        </p>
      ) : null}
    </div>
  );
}

export function ItemExamplesList({
  itemId,
  fallbackExample,
  fallbackExampleReading,
}: ItemExamplesListProps) {
  const [examples, setExamples] = useState<ItemExample[]>([]);

  useEffect(() => {
    let cancelled = false;

    void listItemExamplesByItem(itemId).then((rows) => {
      if (!cancelled) {
        setExamples(rows);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  if (examples.length > 0) {
    return (
      <div className="space-y-2">
        {examples.map((entry) => (
          <ExampleBlock
            key={entry.id}
            example={entry.example}
            exampleReading={entry.exampleReading}
            exampleMeaning={entry.exampleMeaning}
          />
        ))}
      </div>
    );
  }

  if (fallbackExample) {
    return (
      <ExampleBlock example={fallbackExample} exampleReading={fallbackExampleReading} />
    );
  }

  return null;
}
