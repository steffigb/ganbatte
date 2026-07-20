import type { LearningItem } from '@/types/learningItem';
import { cn } from '@/utils/cn';
import { formatItemMeaning } from '@/utils/meaningText';
import { ItemExamplesList } from '@/features/items/components/ItemExamplesList';
import { KanjiFrontReading, KanjiReadingsBlock } from '@/features/review/components/KanjiReadings';

type ReviewCardProps = {
  item: LearningItem;
  isRevealed: boolean;
  onReveal: () => void;
};

function ItemMeta({ item }: { item: LearningItem }) {
  return (
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {item.level} · {item.type}
    </p>
  );
}

export function ReviewCard({ item, isRevealed, onReveal }: ReviewCardProps) {
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <ItemMeta item={item} />

      <div className="space-y-2 text-center">
        <p className="text-4xl font-medium text-slate-900 dark:text-slate-100">{item.japanese}</p>
        {item.type === 'kanji' ? (
          <KanjiFrontReading item={item} />
        ) : item.reading ? (
          <p className="text-lg text-slate-500 dark:text-slate-400">{item.reading}</p>
        ) : null}
      </div>

      {!isRevealed ? (
        <div className="flex justify-center">
          <button
            type="button"
            className={cn(
              'rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium',
              'hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800',
            )}
            onClick={onReveal}
          >
            Show answer
          </button>
        </div>
      ) : (
        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
            {formatItemMeaning(item.meaning, item.meaningAlt)}
          </p>
          {item.type === 'kanji' ? <KanjiReadingsBlock item={item} /> : null}
          <ItemExamplesList
            itemId={item.id}
            fallbackExample={item.example}
            fallbackExampleReading={item.exampleReading}
          />
          {item.notes ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.notes}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
