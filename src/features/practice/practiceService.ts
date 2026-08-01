import { loadStudyContext } from '@/lib/study';
import { doesItemNeedAttention } from '@/lib/topicProgress';
import type { JlptLevel, PartOfSpeech, Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';
import { nowIso } from '@/utils/date';

export type PracticeFilters = {
  skill?: Skill;
  level?: JlptLevel;
  partOfSpeech?: PartOfSpeech;
  topicId?: string;
  strugglingOnly?: boolean;
};

/**
 * Focused Practice is deliberately independent of the SRS pipeline: it never
 * reads or writes user_progress/reviews, so drilling here has zero effect on
 * spaced-repetition scheduling. It's just extra reps on demand.
 */
export async function loadPracticeItems(
  userId: string,
  filters: PracticeFilters,
): Promise<LearningItem[]> {
  const context = await loadStudyContext(userId);
  const now = nowIso();

  let itemIdsForTopic: Set<string> | undefined;
  if (filters.topicId) {
    itemIdsForTopic = new Set(
      context.itemTopics
        .filter((link) => link.topicId === filters.topicId)
        .map((link) => link.itemId),
    );
  }

  const candidates = context.items.filter((item) => {
    if (filters.skill && item.skill !== filters.skill) {
      return false;
    }

    if (filters.level && item.level !== filters.level) {
      return false;
    }

    if (filters.partOfSpeech && item.partOfSpeech !== filters.partOfSpeech) {
      return false;
    }

    if (itemIdsForTopic && !itemIdsForTopic.has(item.id)) {
      return false;
    }

    if (filters.strugglingOnly) {
      const progress = context.progressByItemId.get(item.id);
      const grades = context.gradesByItemId.get(item.id) ?? [];
      if (!doesItemNeedAttention(progress, grades, now)) {
        return false;
      }
    }

    return true;
  });

  return candidates.sort((a, b) => a.japanese.localeCompare(b.japanese, 'ja'));
}
