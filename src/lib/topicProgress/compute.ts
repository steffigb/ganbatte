import {
  doesItemNeedAttention,
  isItemMastered,
} from '@/lib/topicProgress/itemProgress';
import type { ItemTopic } from '@/types/itemRelations';
import type { ReviewGrade } from '@/types/review';
import type { Topic } from '@/types/topic';
import type { TopicProgress } from '@/types/topicProgress';
import type { UserProgress } from '@/types/userProgress';
import { nowIso } from '@/utils/date';

const N5_RECAP_ATTENTION_THRESHOLD = 60;

export type TopicProgressComputeInput = {
  topics: Topic[];
  itemTopics: ItemTopic[];
  progressByItemId: Map<string, UserProgress>;
  gradesByItemId: Map<string, ReviewGrade[]>;
  now?: string;
};

function buildItemIdsByTopic(itemTopics: ItemTopic[]): Map<string, string[]> {
  const itemIdsByTopic = new Map<string, string[]>();

  for (const link of itemTopics) {
    const existing = itemIdsByTopic.get(link.topicId) ?? [];
    existing.push(link.itemId);
    itemIdsByTopic.set(link.topicId, existing);
  }

  return itemIdsByTopic;
}

function maxIso(values: Array<string | undefined>): string | undefined {
  const defined = values.filter((value): value is string => value !== undefined);
  if (defined.length === 0) {
    return undefined;
  }

  return defined.sort().at(-1);
}

export function computeTopicProgress(
  topic: Topic,
  itemIds: string[],
  progressByItemId: Map<string, UserProgress>,
  gradesByItemId: Map<string, ReviewGrade[]>,
  now: string,
): TopicProgress {
  const uniqueItemIds = [...new Set(itemIds)];
  let masteredCount = 0;
  let anyItemNeedsAttention = false;
  const lastReviewTimes: Array<string | undefined> = [];

  for (const itemId of uniqueItemIds) {
    const progress = progressByItemId.get(itemId);
    const grades = gradesByItemId.get(itemId) ?? [];

    if (isItemMastered(progress, grades)) {
      masteredCount += 1;
    }

    if (doesItemNeedAttention(progress, grades, now)) {
      anyItemNeedsAttention = true;
    }

    lastReviewTimes.push(progress?.lastReviewAt);
  }

  const itemCount = uniqueItemIds.length;
  const masteryPercent =
    itemCount === 0 ? 0 : Math.round((masteredCount / itemCount) * 100);

  const needsAttention =
    itemCount > 0 &&
    (anyItemNeedsAttention ||
      (topic.level === 'N5' && masteryPercent < N5_RECAP_ATTENTION_THRESHOLD));

  return {
    topicId: topic.id,
    itemCount,
    masteredCount,
    masteryPercent,
    needsAttention,
    lastStudiedAt: maxIso(lastReviewTimes),
    updatedAt: now,
  };
}

export function computeAllTopicProgress(
  input: TopicProgressComputeInput,
): TopicProgress[] {
  const now = input.now ?? nowIso();
  const itemIdsByTopic = buildItemIdsByTopic(input.itemTopics);

  return input.topics.map((topic) =>
    computeTopicProgress(
      topic,
      itemIdsByTopic.get(topic.id) ?? [],
      input.progressByItemId,
      input.gradesByItemId,
      now,
    ),
  );
}

export function sortTopicsByNeedsAttention(
  progress: TopicProgress[],
): TopicProgress[] {
  return [...progress].sort((left, right) => {
    if (left.needsAttention !== right.needsAttention) {
      return left.needsAttention ? -1 : 1;
    }

    return left.masteryPercent - right.masteryPercent;
  });
}

export function topNeedsAttentionTopics(
  progress: TopicProgress[],
  limit = 3,
): TopicProgress[] {
  return sortTopicsByNeedsAttention(progress)
    .filter((entry) => entry.needsAttention && entry.itemCount > 0)
    .slice(0, limit);
}
