import {
  findPairedItem,
  getItemById,
  getSourceById,
  getTopicById,
  listItemSourcesByItem,
  listItemSourcesByUser,
  listItemTopicsByItem,
  listItemTopicsByUser,
  listSourcesByUser,
  listTopicsByUser,
} from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import type { Source } from '@/types/source';
import type { Topic } from '@/types/topic';

export type ItemDetail = {
  item: LearningItem;
  topics: Topic[];
  sources: { source: Source; reference?: string }[];
  pairedItem?: LearningItem;
};

export type ItemRelations = {
  topics: Topic[];
  sources: { source: Source; reference?: string }[];
};

/** Bulk-loads topics/sources for every item a user has, keyed by item id — used
 * by list views so they don't issue a per-item query for each row shown. */
export async function loadItemRelationsByUser(
  userId: string,
): Promise<Map<string, ItemRelations>> {
  const [itemTopics, itemSources, topics, sources] = await Promise.all([
    listItemTopicsByUser(userId),
    listItemSourcesByUser(userId),
    listTopicsByUser(userId),
    listSourcesByUser(userId),
  ]);

  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const relations = new Map<string, ItemRelations>();

  function entryFor(itemId: string): ItemRelations {
    let entry = relations.get(itemId);
    if (!entry) {
      entry = { topics: [], sources: [] };
      relations.set(itemId, entry);
    }
    return entry;
  }

  for (const link of itemTopics) {
    const topic = topicById.get(link.topicId);
    if (topic) {
      entryFor(link.itemId).topics.push(topic);
    }
  }

  for (const link of itemSources) {
    const source = sourceById.get(link.sourceId);
    if (source) {
      entryFor(link.itemId).sources.push({ source, reference: link.reference });
    }
  }

  return relations;
}

export async function loadItemDetail(itemId: string): Promise<ItemDetail | undefined> {
  const item = await getItemById(itemId);
  if (!item) {
    return undefined;
  }

  const [topicLinks, sourceLinks, pairedItem] = await Promise.all([
    listItemTopicsByItem(itemId),
    listItemSourcesByItem(itemId),
    item.type === 'expression' ? findPairedItem(item.userId, item) : Promise.resolve(undefined),
  ]);

  const topics = (
    await Promise.all(topicLinks.map((link) => getTopicById(link.topicId)))
  ).filter((topic): topic is Topic => Boolean(topic));

  const sourceEntries = await Promise.all(
    sourceLinks.map(async (link) => {
      const source = await getSourceById(link.sourceId);
      return source ? { source, reference: link.reference } : undefined;
    }),
  );
  const sources: { source: Source; reference?: string }[] = sourceEntries.filter(
    (entry) => entry !== undefined,
  );

  return { item, topics, sources, pairedItem };
}
