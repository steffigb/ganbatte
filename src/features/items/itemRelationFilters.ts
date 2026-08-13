import type { ItemRelations } from '@/features/items/itemDetailService';
import type { LearningItem } from '@/types/learningItem';

export type RelationFilter = { topicId: string; sourceId: string; sourceRef: string };

export const ALL_RELATIONS: RelationFilter = {
  topicId: 'all',
  sourceId: 'all',
  sourceRef: 'all',
};

/** Topic/source/source-reference dropdown options derived from whichever items are in
 * scope, sorted by label — used so browse and lesson setup show identical option lists. */
export function deriveRelationOptions(
  items: LearningItem[],
  relations: Map<string, ItemRelations> | null,
): {
  topicOptions: [string, string][];
  sourceOptions: [string, string][];
  sourceRefOptions: [string, string][];
} {
  const topics = new Map<string, string>();
  const sources = new Map<string, string>();
  const sourceRefs = new Set<string>();

  for (const item of items) {
    const itemRelations = relations?.get(item.id);
    for (const topic of itemRelations?.topics ?? []) {
      topics.set(topic.id, topic.name);
    }
    for (const { source, reference } of itemRelations?.sources ?? []) {
      sources.set(source.id, source.label);
      if (reference) {
        sourceRefs.add(reference);
      }
    }
  }

  const sortByLabel = (a: [string, string], b: [string, string]) => a[1].localeCompare(b[1]);

  return {
    topicOptions: [...topics].sort(sortByLabel),
    sourceOptions: [...sources].sort(sortByLabel),
    sourceRefOptions: [...sourceRefs].sort().map((ref) => [ref, ref]),
  };
}

export function matchesRelationFilter(
  itemId: string,
  relations: Map<string, ItemRelations> | null,
  filter: RelationFilter,
): boolean {
  if (filter.topicId === 'all' && filter.sourceId === 'all' && filter.sourceRef === 'all') {
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
  if (
    filter.sourceRef !== 'all' &&
    !itemRelations?.sources.some(({ reference }) => reference === filter.sourceRef)
  ) {
    return false;
  }
  return true;
}
