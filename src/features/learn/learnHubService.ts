import { isSrsItemType } from '@/lib/srs';
import { loadStudyContext, type StudyContext } from '@/lib/study';
import { isItemMastered } from '@/lib/topicProgress';
import {
  buildLessonQueueForGroup,
  countLessonsCompletedToday,
  type LessonGroup,
} from '@/features/learn/lessonService';
import type { LearningItem } from '@/types/learningItem';
import { nowIso } from '@/utils/date';

export type LearnHubCard = {
  group: LessonGroup;
  label: string;
  totalItems: number;
  masteredItems: number;
  /** Unlearned items still in this group's lesson queue. */
  lessonsAvailable: number;
  /** How many of those fit under today's new-items cap. */
  lessonsAvailableToday: number;
  reviewsDue: number;
  hasReviews: boolean;
};

const GROUP_ITEM_TYPES: Record<LessonGroup, LearningItem['type'][]> = {
  'kanji-vocab': ['kanji', 'expression'],
  grammar: ['grammar'],
  reading: ['reading'],
  listening: ['listening'],
};

const GROUP_LABELS: Record<LessonGroup, string> = {
  'kanji-vocab': 'Kanji & Vocabulary',
  grammar: 'Grammar',
  reading: 'Reading',
  listening: 'Listening',
};

export const learnHubGroups: readonly LessonGroup[] = [
  'kanji-vocab',
  'grammar',
  'reading',
  'listening',
];

function countDue(context: StudyContext, types: LearningItem['type'][]): number {
  const now = nowIso();
  let count = 0;

  for (const progress of context.userProgress) {
    if (progress.nextReviewAt > now) {
      continue;
    }

    const item = context.itemsById.get(progress.itemId);
    if (item && types.includes(item.type)) {
      count += 1;
    }
  }

  return count;
}

function buildCard(
  context: StudyContext,
  group: LessonGroup,
  remainingToday: number,
): LearnHubCard {
  const types = GROUP_ITEM_TYPES[group];
  const items = context.items.filter((item) => types.includes(item.type));
  const masteredItems = items.filter((item) =>
    isItemMastered(context.progressByItemId.get(item.id), context.gradesByItemId.get(item.id) ?? []),
  ).length;
  const hasReviews = types.some((type) => isSrsItemType(type));
  const lessonsAvailable = buildLessonQueueForGroup(context, group).length;

  return {
    group,
    label: GROUP_LABELS[group],
    totalItems: items.length,
    masteredItems,
    lessonsAvailable,
    lessonsAvailableToday: Math.min(lessonsAvailable, remainingToday),
    reviewsDue: hasReviews ? countDue(context, types) : 0,
    hasReviews,
  };
}

export async function loadLearnHubCards(userId: string): Promise<LearnHubCard[]> {
  const context = await loadStudyContext(userId);
  const remainingToday = Math.max(
    0,
    context.settings.newItemsPerDay - countLessonsCompletedToday(context),
  );
  return learnHubGroups.map((group) => buildCard(context, group, remainingToday));
}
