import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { learnSkills, routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { Select } from '@/components/ui/Select';
import {
  ALL_RELATIONS,
  deriveRelationOptions,
  ItemList,
  LevelFilterTabs,
  matchesRelationFilter,
  useItemMasteryCounts,
  useItemRelations,
  useItems,
} from '@/features/items';
import type { LevelFilter, RelationFilter } from '@/features/items';
import type { Skill } from '@/types/domain';

/** Skills whose items get SRS progress at all — reading/listening never do, so a
 * mastery breakdown for them would always show 100% "new" and just be noise. */
const SKILLS_WITH_MASTERY: Skill[] = ['kanji', 'vocabulary', 'grammar'];

export function LearnBrowsePage() {
  const { skill } = useParams<{ skill: string }>();
  const isValidSkill = learnSkills.includes(skill as (typeof learnSkills)[number]);
  const browseSkill = isValidSkill ? (skill as Skill) : undefined;
  const [level, setLevel] = useState<LevelFilter>('all');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>(ALL_RELATIONS);
  const [filtersResetKey, setFiltersResetKey] = useState(browseSkill);

  const { items, isLoading, error, removeItem } = useItems({
    skill: browseSkill,
    level: browseSkill ? level : undefined,
  });
  const relations = useItemRelations();

  if (browseSkill !== filtersResetKey) {
    setFiltersResetKey(browseSkill);
    setRelationFilter(ALL_RELATIONS);
  }

  const { topicOptions, sourceOptions, sourceRefOptions } = useMemo(
    () => deriveRelationOptions(items, relations),
    [items, relations],
  );

  const filteredItems = useMemo(
    () => items.filter((item) => matchesRelationFilter(item.id, relations, relationFilter)),
    [items, relations, relationFilter],
  );

  const masteryCounts = useItemMasteryCounts(filteredItems);
  const showMasteryCounts = browseSkill ? SKILLS_WITH_MASTERY.includes(browseSkill) : false;

  return (
    <PageLayout
      title={browseSkill ? `Learn — ${browseSkill}` : 'Learn'}
      description="Browse items by skill, level, topic, and source."
    >
      {!isValidSkill ? (
        <p className="rounded-xl border border-dashed border-green-300 p-4 text-sm text-green-700 dark:border-green-700 dark:text-green-400">
          Unknown skill. Use vocabulary, kanji, grammar, reading, or listening.
        </p>
      ) : (
        <div className="space-y-4">
          <Link
            to={routes.learnHub}
            className="text-sm font-medium text-green-700 underline dark:text-green-400"
          >
            ← Learn overview
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <LevelFilterTabs value={level} onChange={setLevel} />
            {topicOptions.length > 0 ? (
              <Select
                id="browse-topic"
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
                id="browse-source"
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
            {sourceRefOptions.length > 0 ? (
              <Select
                id="browse-source-ref"
                label="Reference"
                className="w-auto"
                value={relationFilter.sourceRef}
                onChange={(event) =>
                  setRelationFilter((current) => ({ ...current, sourceRef: event.target.value }))
                }
                options={[
                  { value: 'all', label: 'All references' },
                  ...sourceRefOptions.map(([ref, label]) => ({ value: ref, label })),
                ]}
              />
            ) : null}
            <Link
              to={routes.add}
              className="text-sm font-medium text-green-800 underline dark:text-green-300"
            >
              Add item
            </Link>
          </div>

          {showMasteryCounts && masteryCounts && filteredItems.length > 0 ? (
            <p className="text-sm text-green-700 dark:text-green-400">
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
