import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import type { ItemSearchResult, TopicSearchResult } from '@/lib/search';
import { cn } from '@/utils/cn';
import { formatItemMeaning } from '@/utils/meaningText';

type SearchResultItemProps = {
  result: ItemSearchResult | TopicSearchResult;
};

function formatMasteryLabel(result: ItemSearchResult | TopicSearchResult): string {
  if (result.kind === 'topic') {
    return `${result.masteryPercent}%`;
  }

  return result.masteryLevel;
}

function formatSource(source: { label: string; reference?: string }): string {
  return source.reference ? `${source.label} (${source.reference})` : source.label;
}

function NeedsAttentionBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      Needs attention
    </span>
  );
}

export function SearchResultItem({ result }: SearchResultItemProps) {
  if (result.kind === 'topic') {
    return (
      <li className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-green-950 dark:text-green-100">
              {result.topic.name}
            </p>
            {result.needsAttention ? <NeedsAttentionBadge /> : null}
          </div>
          <p className="truncate text-green-700 dark:text-green-400">
            {result.topic.level} · {result.topic.skill}
            {result.topic.description ? ` · ${result.topic.description}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-green-700 dark:text-green-300">
            {formatMasteryLabel(result)}
          </span>
          <Link
            to={routes.topics}
            className="rounded-lg border border-green-300 px-2.5 py-1 text-xs hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800"
          >
            View topics
          </Link>
        </div>
      </li>
    );
  }

  const { item } = result;

  return (
    <li className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Link
            to={routes.itemDetail(item.id)}
            className={cn(
              'font-medium text-green-950 hover:underline dark:text-green-100',
              item.type === 'kanji' ? 'text-3xl leading-none' : 'text-base',
            )}
          >
            {item.japanese}
          </Link>
          {item.reading ? (
            <span className="text-xs text-green-700 dark:text-green-400">{item.reading}</span>
          ) : null}
          {result.needsAttention ? <NeedsAttentionBadge /> : null}
        </div>
        <p className="truncate text-green-700 dark:text-green-400">
          {formatItemMeaning(item.meaning, item.meaningAlt)}
          <span className="text-green-600 dark:text-green-500"> · {item.level}</span>
        </p>
        {result.sources.length > 0 ? (
          <p className="truncate text-xs text-green-700 dark:text-green-400">
            {result.sources.map(formatSource).join(' · ')}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs capitalize text-green-700 dark:text-green-400">
          {formatMasteryLabel(result)}
        </span>
        <Link
          to={`${routes.add}?edit=${item.id}`}
          className="rounded-lg border border-green-300 px-2.5 py-1 text-xs hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800"
        >
          Edit
        </Link>
        <Link
          to={routes.study}
          className="rounded-lg border border-green-300 px-2.5 py-1 text-xs hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800"
        >
          Study
        </Link>
      </div>
    </li>
  );
}
