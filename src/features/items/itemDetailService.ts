import {
  getItemById,
  getSourceById,
  getTopicById,
  listItemSourcesByItem,
  listItemTopicsByItem,
} from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import type { Source } from '@/types/source';
import type { Topic } from '@/types/topic';

export type ItemDetail = {
  item: LearningItem;
  topics: Topic[];
  sources: { source: Source; reference?: string }[];
};

export async function loadItemDetail(itemId: string): Promise<ItemDetail | undefined> {
  const item = await getItemById(itemId);
  if (!item) {
    return undefined;
  }

  const [topicLinks, sourceLinks] = await Promise.all([
    listItemTopicsByItem(itemId),
    listItemSourcesByItem(itemId),
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

  return { item, topics, sources };
}
