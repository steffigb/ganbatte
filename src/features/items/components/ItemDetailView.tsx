import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import type { ItemDetail } from '@/features/items/itemDetailService';
import { KanjiCompoundsList } from '@/features/items/components/KanjiCompoundsList';
import { WordKanjiBreakdown } from '@/features/items/components/WordKanjiBreakdown';
import { KanjiReadingsBlock } from '@/features/review/components/KanjiReadings';
import { LogPracticeForm } from '@/features/activity/components/LogPracticeForm';
import { cn } from '@/utils/cn';
import { formatItemMeaning } from '@/utils/meaningText';
import {
  partOfSpeechLabel,
  transitivityLabel,
  verbTypeLabel,
} from '@/utils/wordClassLabels';

type ItemDetailViewProps = {
  detail: ItemDetail;
  userId: string;
};

function WordClassBadges({ item }: { item: ItemDetail['item'] }) {
  const badges = [
    partOfSpeechLabel(item.partOfSpeech),
    verbTypeLabel(item.verbType),
    transitivityLabel(item.transitivity),
  ].filter((label): label is string => Boolean(label));

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((label) => (
        <span
          key={label}
          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function ItemDetailView({ detail, userId }: ItemDetailViewProps) {
  const { item, topics, sources, pairedItem } = detail;

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p
            className={cn(
              'font-medium text-slate-900 dark:text-slate-100',
              item.type === 'kanji' ? 'text-5xl leading-none' : 'text-3xl',
            )}
          >
            {item.japanese}
          </p>
          {item.type !== 'kanji' && item.reading ? (
            <p className="text-lg text-slate-500 dark:text-slate-400">{item.reading}</p>
          ) : null}
        </div>
        <Link
          to={`${routes.add}?edit=${item.id}`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Edit
        </Link>
      </div>

      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {formatItemMeaning(item.meaning, item.meaningAlt)}
      </p>

      {item.type === 'kanji' ? (
        <>
          <KanjiReadingsBlock item={item} />
          <KanjiCompoundsList userId={userId} kanjiCharacter={item.japanese} linkToDetail />
        </>
      ) : null}

      {item.type === 'expression' ? (
        <>
          <WordClassBadges item={item} />
          {pairedItem ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Paired verb:{' '}
              <Link
                to={routes.itemDetail(pairedItem.id)}
                className="font-medium text-slate-900 underline dark:text-slate-100"
              >
                {pairedItem.japanese}
              </Link>
            </p>
          ) : null}
          {item.example ? (
            <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
              <p className="text-slate-900 dark:text-slate-100">{item.example}</p>
              {item.exampleReading ? (
                <p className="mt-1 text-slate-500 dark:text-slate-400">{item.exampleReading}</p>
              ) : null}
              {item.exampleMeaning ? (
                <p className="mt-1 text-slate-500 dark:text-slate-400">{item.exampleMeaning}</p>
              ) : null}
            </div>
          ) : null}
          <WordKanjiBreakdown userId={userId} japanese={item.japanese} />
        </>
      ) : null}

      {item.type === 'reading' ? (
        <>
          {item.passageText ? (
            <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              {item.passageText}
            </div>
          ) : null}
          <LogPracticeForm skill="reading" itemId={item.id} topicId={topics[0]?.id} />
        </>
      ) : null}

      {item.type === 'listening' ? (
        <>
          {item.audioUrl ? <audio controls className="w-full" src={item.audioUrl} /> : null}
          <LogPracticeForm skill="listening" itemId={item.id} topicId={topics[0]?.id} />
        </>
      ) : null}

      {item.notes ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{item.notes}</p>
      ) : null}

      {topics.length > 0 ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Topics</p>
          <p className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            {topics.map((topic, index) => (
              <span key={topic.id}>
                <Link
                  to={routes.topicDetail(topic.id)}
                  className="font-medium text-slate-900 underline dark:text-slate-100"
                >
                  {topic.name}
                </Link>
                {index < topics.length - 1 ? ',' : null}
              </span>
            ))}
          </p>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sources</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {sources
              .map(({ source, reference }) =>
                reference ? `${source.label} (${reference})` : source.label,
              )
              .join(', ')}
          </p>
        </div>
      ) : null}
    </div>
  );
}
