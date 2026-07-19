import { SearchResultItem } from '@/features/search/components/SearchResultItem';
import type { SearchResultGroup } from '@/lib/search';

type SearchResultGroupViewProps = {
  group: SearchResultGroup;
};

export function SearchResultGroupView({ group }: SearchResultGroupViewProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {group.label} ({group.results.length})
      </h2>
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
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
