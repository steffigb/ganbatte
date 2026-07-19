import { getDeviceId } from '@/lib/db/deviceId';
import {
  listItemsByUser,
  listReviewsByItem,
  listUserProgressByUser,
  upsertReview,
  upsertUserProgress,
} from '@/lib/db';
import {
  addDays,
  applySm2Grade,
  createInitialProgressFields,
  DAILY_REVIEW_LIMIT,
  gradeToAccuracy,
  isSrsItemType,
} from '@/lib/srs';
import type { LearningItem } from '@/types/learningItem';
import type { Review, ReviewGrade } from '@/types/review';
import type { UserProgress } from '@/types/userProgress';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export type ReviewQueueEntry = {
  item: LearningItem;
  progress: UserProgress | null;
  sortKey: string;
};

export type ReviewSessionStats = {
  reviewed: number;
  againCount: number;
};

export async function buildReviewQueue(userId: string): Promise<ReviewQueueEntry[]> {
  const [items, allProgress] = await Promise.all([
    listItemsByUser(userId),
    listUserProgressByUser(userId),
  ]);

  const srsItems = items.filter((item) => isSrsItemType(item.type));
  const progressByItemId = new Map(allProgress.map((progress) => [progress.itemId, progress]));
  const now = nowIso();
  const entries: ReviewQueueEntry[] = [];

  for (const progress of allProgress) {
    if (progress.nextReviewAt > now) {
      continue;
    }

    const item = srsItems.find((candidate) => candidate.id === progress.itemId);
    if (!item) {
      continue;
    }

    entries.push({
      item,
      progress,
      sortKey: progress.nextReviewAt,
    });
  }

  for (const item of srsItems) {
    if (progressByItemId.has(item.id)) {
      continue;
    }

    entries.push({
      item,
      progress: null,
      sortKey: now,
    });
  }

  return entries
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
    .slice(0, DAILY_REVIEW_LIMIT);
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
