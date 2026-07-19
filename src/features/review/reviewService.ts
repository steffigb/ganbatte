import { getDeviceId } from '@/lib/db/deviceId';
import {
  listReviewsByItem,
  upsertReview,
  upsertUserProgress,
} from '@/lib/db';
import {
  addDays,
  applySm2Grade,
  createInitialProgressFields,
  gradeToAccuracy,
} from '@/lib/srs';
import { loadStudyContext } from '@/lib/study';
import {
  buildReviewQueueFromContext,
  countDueCards,
  type ReviewQueueEntry,
} from '@/features/review/buildReviewQueue';
import type { LearningItem } from '@/types/learningItem';
import type { Review, ReviewGrade } from '@/types/review';
import type { UserProgress } from '@/types/userProgress';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export type { ReviewQueueEntry } from '@/features/review/buildReviewQueue';

export type ReviewSessionStats = {
  reviewed: number;
  againCount: number;
};

export async function buildReviewQueue(userId: string): Promise<ReviewQueueEntry[]> {
  const context = await loadStudyContext(userId);
  return buildReviewQueueFromContext(context);
}

export async function countDueReviewCards(userId: string): Promise<number> {
  const context = await loadStudyContext(userId);
  return countDueCards(context);
}

async function recentGradesForItem(itemId: string): Promise<ReviewGrade[]> {
  const reviews = await listReviewsByItem(itemId);
  return reviews.slice(-3).map((review) => review.grade);
}

export async function gradeReview(
  userId: string,
  item: LearningItem,
  existingProgress: UserProgress | null,
  grade: ReviewGrade,
  responseTimeMs?: number,
): Promise<{ progress: UserProgress; review: Review }> {
  const reviewedAt = nowIso();
  const deviceId = await getDeviceId();

  const review: Review = {
    id: createId(),
    userId,
    itemId: item.id,
    grade,
    responseTimeMs,
    reviewedAt,
    deviceId,
    createdAt: reviewedAt,
    updatedAt: reviewedAt,
  };

  await upsertReview(review);

  const recentGrades = await recentGradesForItem(item.id);
  const accuracyRecent = gradeToAccuracy(recentGrades);

  const baseProgress = existingProgress ?? {
    id: createId(),
    userId,
    itemId: item.id,
    ...createInitialProgressFields(),
    nextReviewAt: reviewedAt,
    createdAt: reviewedAt,
    updatedAt: reviewedAt,
  };

  const sm2Result = applySm2Grade(baseProgress, grade, accuracyRecent);
  const nextReviewAt = addDays(reviewedAt, sm2Result.intervalDays);

  const progress: UserProgress = {
    ...baseProgress,
    ...sm2Result,
    accuracyRecent,
    lastReviewAt: reviewedAt,
    nextReviewAt,
    updatedAt: reviewedAt,
  };

  await upsertUserProgress(progress);

  return { progress, review };
}
