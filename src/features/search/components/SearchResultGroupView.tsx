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
        'flex flex-col overflow-hidden rounded-xl border border-green-200 bg-white dark:border-green-800 dark:bg-green-900',
        className,
      )}
    >
      <h2 className="border-b border-green-200 px-4 py-2 text-sm font-semibold text-green-950 dark:border-green-800 dark:text-green-100">
        {group.label}{' '}
        <span className="font-normal text-green-700 dark:text-green-400">
          ({group.results.length})
        </span>
      </h2>
      <ul className="max-h-[26rem] divide-y divide-green-200 overflow-y-auto dark:divide-green-800">
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
