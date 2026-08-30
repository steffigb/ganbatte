import { SearchResultItem } from '@/features/search/components/SearchResultItem';
import type { SearchResultGroup } from '@/lib/search';
import { cn } from '@/utils/cn';

type SearchResultGroupViewProps = {
  group: SearchResultGroup;
  className?: string;
};

export function SearchResultGroupView({ group, className }: SearchResultGroupViewProps) {
  return (
    <section
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <h2 className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
        {group.label}{' '}
        <span className="font-normal text-slate-500 dark:text-slate-400">
          ({group.results.length})
        </span>
      </h2>
      <ul className="max-h-[26rem] divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
        {group.results.map((result) => (
          <SearchResultItem
            key={result.kind === 'topic' ? result.topic.id : result.item.id}
            result={result}
          />
        ))}
      </ul>
    </section>
  );
}
