import {
  ensureSyncMeta,
  listItemTopicsByUser,
  listReviewsByUser,
  listTopicsByUser,
  listUserProgressByUser,
} from '@/lib/db';
import { computeAllTopicProgress } from '@/lib/topicProgress';
import type { ReviewGrade } from '@/types/review';
import type { TopicProgress } from '@/types/topicProgress';
import type { UserProgress } from '@/types/userProgress';

function buildProgressByItemId(progress: UserProgress[]): Map<string, UserProgress> {
  return new Map(progress.map((entry) => [entry.itemId, entry]));
}

function buildGradesByItemId(
  reviews: Array<{ itemId: string; grade: ReviewGrade }>,
): Map<string, ReviewGrade[]> {
  const gradesByItemId = new Map<string, ReviewGrade[]>();

  for (const review of reviews) {
    const existing = gradesByItemId.get(review.itemId) ?? [];
    existing.push(review.grade);
    gradesByItemId.set(review.itemId, existing);
  }

  return gradesByItemId;
}

export async function loadTopicProgressForUser(userId: string): Promise<TopicProgress[]> {
  await ensureSyncMeta();

  const [topics, itemTopics, userProgress, reviews] = await Promise.all([
    listTopicsByUser(userId),
    listItemTopicsByUser(userId),
    listUserProgressByUser(userId),
    listReviewsByUser(userId),
  ]);

  return computeAllTopicProgress({
    topics,
    itemTopics,
    progressByItemId: buildProgressByItemId(userProgress),
    gradesByItemId: buildGradesByItemId(reviews),
  });
}

export async function getTopicProgressByTopicId(
  userId: string,
  topicId: string,
): Promise<TopicProgress | undefined> {
  const progress = await loadTopicProgressForUser(userId);
  return progress.find((entry) => entry.topicId === topicId);
}
