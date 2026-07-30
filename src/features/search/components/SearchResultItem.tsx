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

export function SearchResultItem({ result }: SearchResultItemProps) {
  if (result.kind === 'topic') {
    return (
      <li className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {result.topic.name}
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Topic
            </span>
            {result.needsAttention ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Needs attention
              </span>
            ) : null}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {result.topic.level} · {result.topic.skill}
            {result.topic.description ? ` · ${result.topic.description}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-slate-600 dark:text-slate-300">
            {formatMasteryLabel(result)}
          </span>
          <Link
            to={routes.topics}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            View topics
          </Link>
        </div>
      </li>
    );
  }

  const { item } = result;

  return (
    <li
      className={cn(
        'flex items-start justify-between gap-3 px-4 py-3 text-sm',
        item.type === 'kanji' && 'py-4',
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0">
            <Link
              to={routes.itemDetail(item.id)}
              className={cn(
                'block font-medium text-slate-900 hover:underline dark:text-slate-100',
                item.type === 'kanji' ? 'text-4xl leading-none' : 'text-base',
              )}
            >
              {item.japanese}
            </Link>
            {item.reading ? (
              <p className="text-slate-500 dark:text-slate-400">{item.reading}</p>
            ) : null}
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {item.type}
          </span>
          {result.needsAttention ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Needs attention
            </span>
          ) : null}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {formatItemMeaning(item.meaning, item.meaningAlt)}
        </p>
        <p className="text-slate-500 dark:text-slate-500">
          {item.level} · {item.skill}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="capitalize text-slate-600 dark:text-slate-300">
          {formatMasteryLabel(result)}
        </span>
        <div className="flex gap-2">
          <Link
            to={`${routes.add}?edit=${item.id}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Edit
          </Link>
          <Link
            to={routes.study}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Study
          </Link>
        </div>
      </div>
    </li>
  );
}
