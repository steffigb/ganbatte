import type { ItemRelations } from '@/features/items/itemDetailService';
import type { LearningItem } from '@/types/learningItem';

export type RelationFilter = { topicId: string; sourceId: string };

export const ALL_RELATIONS: RelationFilter = { topicId: 'all', sourceId: 'all' };

/** Topic/source dropdown options derived from whichever items are in scope,
 * sorted by label — used so browse and lesson setup show identical option lists. */
export function deriveRelationOptions(
  items: LearningItem[],
  relations: Map<string, ItemRelations> | null,
): { topicOptions: [string, string][]; sourceOptions: [string, string][] } {
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
}

export function matchesRelationFilter(
  itemId: string,
  relations: Map<string, ItemRelations> | null,
  filter: RelationFilter,
): boolean {
  if (filter.topicId === 'all' && filter.sourceId === 'all') {
    return true;
  }

  const itemRelations = relations?.get(itemId);
  if (filter.topicId !== 'all' && !itemRelations?.topics.some((topic) => topic.id === filter.topicId)) {
    return false;
  }
  if (
    filter.sourceId !== 'all' &&
    !itemRelations?.sources.some(({ source }) => source.id === filter.sourceId)
  ) {
    return false;
  }
  return true;
}
