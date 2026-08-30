import type { LearningItem } from '@/types/learningItem';
import { cn } from '@/utils/cn';
import { formatItemMeaning } from '@/utils/meaningText';
import {
  partOfSpeechLabel,
  transitivityLabel,
  verbTypeLabel,
} from '@/utils/wordClassLabels';
import { useAuth } from '@/features/auth';
import { ExampleReferences } from '@/features/items/components/ExampleReferences';
import { KanjiCompoundsList } from '@/features/items/components/KanjiCompoundsList';
import { PairedVerbHint } from '@/features/items/components/PairedVerbHint';
import { KanjiReadingsBlock } from '@/features/review/components/KanjiReadings';

type ReviewCardProps = {
  item: LearningItem;
  isRevealed: boolean;
  onReveal: () => void;
};

function ItemMeta({ item }: { item: LearningItem }) {
  return (
    <p className="text-xs uppercase tracking-wide text-green-700 dark:text-green-400">
      {item.level} · {item.type}
    </p>
  );
}

function WordClassBadges({ item }: { item: LearningItem }) {
  const badges = [
    partOfSpeechLabel(item.partOfSpeech),
    verbTypeLabel(item.verbType),
    transitivityLabel(item.transitivity),
  ].filter((label): label is string => Boolean(label));

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {badges.map((label) => (
        <span
          key={label}
          className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-300"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function ExampleSentence({ item }: { item: LearningItem }) {
  if (!item.example) {
    return null;
  }

  return (
    <div className="rounded-lg bg-green-50 p-3 text-sm dark:bg-green-800">
      <p className="text-green-950 dark:text-green-100">{item.example}</p>
      {item.exampleReading ? (
        <p className="mt-1 text-green-700 dark:text-green-400">{item.exampleReading}</p>
      ) : null}
      {item.exampleMeaning ? (
        <p className="mt-1 text-green-700 dark:text-green-400">{item.exampleMeaning}</p>
      ) : null}
    </div>
  );
}

export function ReviewCard({ item, isRevealed, onReveal }: ReviewCardProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-6 rounded-xl border border-green-200 bg-white p-6 dark:border-green-800 dark:bg-green-900">
      <ItemMeta item={item} />

      <div className="space-y-2 text-center">
        <p className="text-4xl font-medium text-green-950 dark:text-green-100">{item.japanese}</p>
        {item.type !== 'kanji' && item.reading ? (
          <p className="text-lg text-green-700 dark:text-green-400">{item.reading}</p>
        ) : null}
      </div>

      {!isRevealed ? (
        <div className="flex justify-center">
          <button
            type="button"
            className={cn(
              'rounded-lg border border-green-300 px-4 py-2 text-sm font-medium',
              'hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800',
            )}
            onClick={onReveal}
          >
            Show answer
          </button>
        </div>
      ) : (
        <div className="space-y-3 border-t border-green-200 pt-4 dark:border-green-800">
          <p className="text-lg font-medium text-green-950 dark:text-green-100">
            {formatItemMeaning(item.meaning, item.meaningAlt)}
          </p>
          {item.type === 'kanji' ? (
            <>
              <KanjiReadingsBlock item={item} />
              {user ? (
                <KanjiCompoundsList userId={user.id} kanjiCharacter={item.japanese} />
              ) : null}
            </>
          ) : (
            <>
              {item.type === 'expression' ? <WordClassBadges item={item} /> : null}
              {item.type === 'grammar' && item.formation ? (
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {item.formation}
                </p>
              ) : null}
              {item.type === 'grammar' && item.explanation ? (
                <p className="text-sm text-green-700 dark:text-green-400">{item.explanation}</p>
              ) : null}
              <ExampleSentence item={item} />
              {item.type === 'expression' && user ? (
                <PairedVerbHint userId={user.id} item={item} />
              ) : null}
              {item.type === 'grammar' && user ? (
                <ExampleReferences userId={user.id} example={item.example} />
              ) : null}
            </>
          )}
          {item.notes ? (
            <p className="text-sm text-green-700 dark:text-green-400">{item.notes}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
