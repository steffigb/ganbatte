import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { deriveRelationOptions, LevelFilterTabs } from '@/features/items';
import type { LessonGroup } from '@/features/learn/lessonService';
import type { LessonSessionState } from '@/features/learn/hooks/useLessonSession';

type LessonSetupProps = {
  session: LessonSessionState;
  group: LessonGroup;
};

const typeOptions = [
  { value: 'all', label: 'Kanji + vocabulary' },
  { value: 'kanji', label: 'Kanji only' },
  { value: 'expression', label: 'Vocabulary only' },
];

export function LessonSetup({ session, group }: LessonSetupProps) {
  const {
    candidateEntries,
    filteredEntries,
    relations,
    level,
    setLevel,
    type,
    setType,
    relationFilter,
    setRelationFilter,
    targetCount,
    setTargetCount,
    selectedIds,
    toggleSelect,
    start,
  } = session;

  const { topicOptions, sourceOptions } = useMemo(
    () => deriveRelationOptions(candidateEntries.map((entry) => entry.item), relations),
    [candidateEntries, relations],
  );

  if (candidateEntries.length === 0) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-green-300 p-6 text-center dark:border-green-700">
        <p className="text-sm text-green-700 dark:text-green-400">
          No new items left in this group.
        </p>
        <Link
          to={routes.learnHub}
          className="inline-block rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 dark:bg-green-100 dark:text-green-900 dark:hover:bg-green-200"
        >
          Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <LevelFilterTabs value={level} onChange={setLevel} />
        {group === 'kanji-vocab' ? (
          <Select
            id="lesson-setup-type"
            label="Type"
            className="w-auto"
            value={type}
            onChange={(event) =>
              setType(event.target.value as typeof type)
            }
            options={typeOptions}
          />
        ) : null}
        {topicOptions.length > 0 ? (
          <Select
            id="lesson-setup-topic"
            label="Topic"
            className="w-auto"
            value={relationFilter.topicId}
            onChange={(event) =>
              setRelationFilter((current) => ({ ...current, topicId: event.target.value }))
            }
            options={[
              { value: 'all', label: 'All topics' },
              ...topicOptions.map(([id, name]) => ({ value: id, label: name })),
            ]}
          />
        ) : null}
        {sourceOptions.length > 0 ? (
          <Select
            id="lesson-setup-source"
            label="Source"
            className="w-auto"
            value={relationFilter.sourceId}
            onChange={(event) =>
              setRelationFilter((current) => ({ ...current, sourceId: event.target.value }))
            }
            options={[
              { value: 'all', label: 'All sources' },
              ...sourceOptions.map(([id, label]) => ({ value: id, label })),
            ]}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          id="lesson-setup-count"
          label="How many"
          type="number"
          min={1}
          max={Math.max(1, filteredEntries.length)}
          value={targetCount}
          onChange={(event) => setTargetCount(Math.max(1, Number(event.target.value) || 1))}
          className="w-24"
        />
        <p className="text-sm text-green-700 dark:text-green-400">
          {filteredEntries.length} item{filteredEntries.length === 1 ? '' : 's'} available ·{' '}
          {selectedIds.size} selected
        </p>
      </div>

      {filteredEntries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-green-300 p-4 text-sm text-green-700 dark:border-green-700 dark:text-green-400">
          No items match these filters.
        </p>
      ) : (
        <ul className="max-h-96 space-y-1 overflow-y-auto rounded-xl border border-green-200 p-2 dark:border-green-800">
          {filteredEntries.map(({ item, kanjiReady }) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-green-50 dark:hover:bg-green-800">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
                <span className="flex-1 text-sm">
                  <span className="font-medium text-green-950 dark:text-green-100">
                    {item.japanese}
                  </span>{' '}
                  <span className="text-green-700 dark:text-green-400">{item.meaning}</span>
                  {!kanjiReady ? (
                    <span className="ml-2 text-xs text-amber-600 dark:text-amber-500">
                      kanji not learned yet
                    </span>
                  ) : null}
                </span>
                <span className="rounded-full border border-green-300 px-2 py-0.5 text-xs text-green-700 dark:border-green-600 dark:text-green-400">
                  {item.level}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={selectedIds.size === 0} onClick={start}>
          Start lesson ({selectedIds.size})
        </Button>
        <Link
          to={routes.learnHub}
          className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800"
        >
          Back to Learn
        </Link>
      </div>
    </div>
  );
}
