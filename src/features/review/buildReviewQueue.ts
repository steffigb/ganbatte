import { DAILY_REVIEW_LIMIT, isSrsItemType } from '@/lib/srs';
import type { StudyContext } from '@/lib/study/loadStudyContext';
import {
  doesItemNeedAttention,
  isItemMastered,
  topNeedsAttentionTopics,
} from '@/lib/topicProgress';
import type { ItemTopic } from '@/types/itemRelations';
import type { LearningItem } from '@/types/learningItem';
import type { UserProgress } from '@/types/userProgress';
import { nowIso } from '@/utils/date';

export type ReviewQueueEntry = {
  item: LearningItem;
  progress: UserProgress | null;
  sortKey: string;
};

export const WEAKNESS_BOOST_TARGET = 8;
export const WEAKNESS_TOPIC_LIMIT = 3;

function buildItemIdsByTopic(itemTopics: ItemTopic[]): Map<string, string[]> {
  const itemIdsByTopic = new Map<string, string[]>();

  for (const link of itemTopics) {
    const existing = itemIdsByTopic.get(link.topicId) ?? [];
    existing.push(link.itemId);
    itemIdsByTopic.set(link.topicId, existing);
  }

  return itemIdsByTopic;
}

function toQueueEntry(
  item: LearningItem,
  progress: UserProgress | null,
  sortKey: string,
): ReviewQueueEntry {
  return { item, progress, sortKey };
}

function buildDueEntries(context: StudyContext, now: string): ReviewQueueEntry[] {
  const srsItems = context.items.filter((item) => isSrsItemType(item.type));
  const entries: ReviewQueueEntry[] = [];

  for (const progress of context.userProgress) {
    if (progress.nextReviewAt > now) {
      continue;
    }

    const item = srsItems.find((candidate) => candidate.id === progress.itemId);
    if (!item) {
      continue;
    }

    entries.push(toQueueEntry(item, progress, progress.nextReviewAt));
  }

  for (const item of srsItems) {
    if (context.progressByItemId.has(item.id)) {
      continue;
    }

    entries.push(toQueueEntry(item, null, now));
  }

  return entries.sort((left, right) => left.sortKey.localeCompare(right.sortKey));
}

function weaknessPriority(context: StudyContext, item: LearningItem, now: string): number {
  const progress = context.progressByItemId.get(item.id);
  const grades = context.gradesByItemId.get(item.id) ?? [];

  if (doesItemNeedAttention(progress, grades, now)) {
    return 0;
  }

  if (!isItemMastered(progress, grades)) {
    return 1;
  }

  return 2;
}

function buildWeaknessEntries(context: StudyContext, now: string): ReviewQueueEntry[] {
  const weakTopics = topNeedsAttentionTopics(context.topicProgress, WEAKNESS_TOPIC_LIMIT);
  const itemIdsByTopic = buildItemIdsByTopic(context.itemTopics);
  const perTopicLimit = Math.max(1, Math.ceil(WEAKNESS_BOOST_TARGET / WEAKNESS_TOPIC_LIMIT));
  const entries: ReviewQueueEntry[] = [];

  for (const topicProgress of weakTopics) {
    const itemIds = [...new Set(itemIdsByTopic.get(topicProgress.topicId) ?? [])];
    const candidates = itemIds
      .map((itemId) => context.itemsById.get(itemId))
      .filter((item): item is LearningItem => item !== undefined && isSrsItemType(item.type))
      .sort(
        (left, right) =>
          weaknessPriority(context, left, now) - weaknessPriority(context, right, now),
      )
      .slice(0, perTopicLimit);

    for (const item of candidates) {
      entries.push(
        toQueueEntry(item, context.progressByItemId.get(item.id) ?? null, `weak-${topicProgress.topicId}`),
      );
    }
  }

  return entries.slice(0, WEAKNESS_BOOST_TARGET);
}

function buildN5RecapEntries(context: StudyContext, limit: number, now: string): ReviewQueueEntry[] {
  if (limit <= 0) {
    return [];
  }

  const candidates = context.items
    .filter((item) => isSrsItemType(item.type) && item.level === 'N5')
    .sort((left, right) => weaknessPriority(context, left, now) - weaknessPriority(context, right, now))
    .slice(0, limit);

  return candidates.map((item) =>
    toQueueEntry(item, context.progressByItemId.get(item.id) ?? null, `n5-${item.id}`),
  );
}

function mergeQueueSections(
  sections: ReviewQueueEntry[][],
  limit: number,
): ReviewQueueEntry[] {
  const seen = new Set<string>();
  const merged: ReviewQueueEntry[] = [];

  for (const section of sections) {
    for (const entry of section) {
      if (seen.has(entry.item.id)) {
        continue;
      }

      merged.push(entry);
      seen.add(entry.item.id);

      if (merged.length >= limit) {
        return merged;
      }
    }
  }

  return merged;
}

export function buildReviewQueueFromContext(context: StudyContext): ReviewQueueEntry[] {
  const now = nowIso();
  const dueEntries = buildDueEntries(context, now);
  const weaknessEntries = buildWeaknessEntries(context, now);
  const n5Limit = Math.round(DAILY_REVIEW_LIMIT * context.settings.n5RecapRatio);
  const n5Entries = buildN5RecapEntries(context, n5Limit, now);

  return mergeQueueSections([dueEntries, weaknessEntries, n5Entries], DAILY_REVIEW_LIMIT);
}

export function countDueCards(context: StudyContext): number {
  return buildDueEntries(context, nowIso()).length;
}
