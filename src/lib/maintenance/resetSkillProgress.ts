import {
  deleteReview,
  deleteUserProgress,
  getUserProgressByItem,
  listItemsByUser,
  listReviewsByItem,
} from '@/lib/db';
import type { Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';

const RESETTABLE_SKILLS: Skill[] = ['kanji', 'vocabulary', 'grammar'];

export type ResetProgressResult = {
  itemCount: number;
  reviewCount: number;
};

async function resettableItems(userId: string): Promise<LearningItem[]> {
  const items = await listItemsByUser(userId);
  return items.filter((item) => RESETTABLE_SKILLS.includes(item.skill));
}

/** Count of kanji/vocabulary/grammar items that currently have SRS progress
 * (i.e. aren't already "not started") — shown as a preview before reset. */
export async function countStartedItems(userId: string): Promise<number> {
  const items = await resettableItems(userId);

  let count = 0;
  for (const item of items) {
    if (await getUserProgressByItem(userId, item.id)) {
      count += 1;
    }
  }

  return count;
}

/** Deletes SRS progress and review history for every kanji/vocabulary/grammar
 * item, so they go back to "not started" (no `UserProgress` row) and re-enter
 * Lessons as brand-new. The items themselves, topics, and sources are untouched. */
export async function resetSkillProgress(userId: string): Promise<ResetProgressResult> {
  const items = await resettableItems(userId);

  let itemCount = 0;
  let reviewCount = 0;

  for (const item of items) {
    const reviews = await listReviewsByItem(item.id);
    for (const review of reviews) {
      await deleteReview(review.id);
    }
    reviewCount += reviews.length;

    const progress = await getUserProgressByItem(userId, item.id);
    if (progress) {
      await deleteUserProgress(progress.id);
      itemCount += 1;
    }
  }

  return { itemCount, reviewCount };
}
