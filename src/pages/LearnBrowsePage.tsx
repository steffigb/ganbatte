import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { learnSkills, routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { Select } from '@/components/ui/Select';
import { ItemList, useItemMasteryCounts, useItemRelations, useItems } from '@/features/items';
import type { LevelFilter } from '@/features/items';
import type { Skill } from '@/types/domain';
import { cn } from '@/utils/cn';

/** Skills whose items get SRS progress at all — reading/listening never do, so a
 * mastery breakdown for them would always show 100% "new" and just be noise. */
const SKILLS_WITH_MASTERY: Skill[] = ['kanji', 'vocabulary', 'grammar'];

export function LearnBrowsePage() {
  const { skill } = useParams<{ skill: string }>();
  const isValidSkill = learnSkills.includes(skill as (typeof learnSkills)[number]);
  const browseSkill = isValidSkill ? (skill as Skill) : undefined;
  const [level, setLevel] = useState<LevelFilter>('all');
  const [topicId, setTopicId] = useState('all');
  const [sourceId, setSourceId] = useState('all');
  const [filtersResetKey, setFiltersResetKey] = useState(browseSkill);

  const { items, isLoading, error, removeItem } = useItems({
    skill: browseSkill,
    level: browseSkill ? level : undefined,
  });
  const relations = useItemRelations();

  if (browseSkill !== filtersResetKey) {
    setFiltersResetKey(browseSkill);
    setTopicId('all');
    setSourceId('all');
  }

  const { topicOptions, sourceOptions } = useMemo(() => {
    const topics = new Map<string, string>();
    const sources = new Map<string, string>();

    for (const item of items) {
      const itemRelations = relations?.get(item.id);
      for (const topic of itemRelations?.topics ?? []) {
        topics.set(topic.id, topic.name);
      }
      for (const { source } of itemRelations?.sources ?? []) {
        sources.set(source.id, source.label);
      }
    }

    const sortByLabel = (a: [string, string], b: [string, string]) => a[1].localeCompare(b[1]);

    return {
      topicOptions: [...topics].sort(sortByLabel),
      sourceOptions: [...sources].sort(sortByLabel),
    };
  }, [items, relations]);

  const filteredItems = useMemo(() => {
    if (topicId === 'all' && sourceId === 'all') {
      return items;
    }

    return items.filter((item) => {
      const itemRelations = relations?.get(item.id);
      if (topicId !== 'all' && !itemRelations?.topics.some((topic) => topic.id === topicId)) {
        return false;
      }
      if (
        sourceId !== 'all' &&
        !itemRelations?.sources.some(({ source }) => source.id === sourceId)
      ) {
        return false;
      }
      return true;
    });
  }, [items, relations, topicId, sourceId]);

  const masteryCounts = useItemMasteryCounts(filteredItems);
  const showMasteryCounts = browseSkill ? SKILLS_WITH_MASTERY.includes(browseSkill) : false;

  return (
    <PageLayout
      title={browseSkill ? `Learn — ${browseSkill}` : 'Learn'}
      description="Browse items by skill, level, topic, and source."
    >
      {!isValidSkill ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          Unknown skill. Use vocabulary, kanji, grammar, reading, or listening.
        </p>
      ) : (
        <div className="space-y-4">
          <Link
            to={routes.learnHub}
            className="text-sm font-medium text-slate-600 underline dark:text-slate-400"
          >
            ← Learn overview
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 p-1 dark:border-slate-700">
              {(['all', 'N4', 'N5'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm',
                    level === option
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                  onClick={() => setLevel(option)}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </div>
            {topicOptions.length > 0 ? (
              <Select
                id="browse-topic"
                label="Topic"
                className="w-auto"
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                options={[
                  { value: 'all', label: 'All topics' },
                  ...topicOptions.map(([id, name]) => ({ value: id, label: name })),
                ]}
              />
            ) : null}
            {sourceOptions.length > 0 ? (
              <Select
                id="browse-source"
                label="Source"
                className="w-auto"
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
                options={[
                  { value: 'all', label: 'All sources' },
                  ...sourceOptions.map(([id, label]) => ({ value: id, label })),
                ]}
              />
            ) : null}
            <Link
              to={routes.add}
              className="text-sm font-medium text-slate-700 underline dark:text-slate-300"
            >
              Add item
            </Link>
          </div>

          {showMasteryCounts && masteryCounts && filteredItems.length > 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {filteredItems.length} {browseSkill} · {masteryCounts.mastered} mastered ·{' '}
              {masteryCounts.familiar} familiar · {masteryCounts.learning} learning ·{' '}
              {masteryCounts.new} new
            </p>
          ) : null}

          <ItemList
            items={filteredItems}
            isLoading={isLoading}
            error={error}
            onDelete={removeItem}
          />
        </div>
      )}
    </PageLayout>
  );
}
