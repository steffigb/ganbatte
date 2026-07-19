import {
  ensureSyncMeta,
  listItemTopicsByUser,
  listItemsByUser,
  listReviewsByUser,
  listTopicsByUser,
  listUserProgressByUser,
} from '@/lib/db';
import { ensureAppSettings } from '@/lib/settings';
import { computeAllTopicProgress } from '@/lib/topicProgress';
import type { AppSettings } from '@/types/appSettings';
import type { ItemTopic } from '@/types/itemRelations';
import type { LearningItem } from '@/types/learningItem';
import type { ReviewGrade } from '@/types/review';
import type { Topic } from '@/types/topic';
import type { TopicProgress } from '@/types/topicProgress';
import type { UserProgress } from '@/types/userProgress';

export type StudyContext = {
  settings: AppSettings;
  items: LearningItem[];
  itemsById: Map<string, LearningItem>;
  topics: Topic[];
  topicsById: Map<string, Topic>;
  itemTopics: ItemTopic[];
  userProgress: UserProgress[];
  progressByItemId: Map<string, UserProgress>;
  gradesByItemId: Map<string, ReviewGrade[]>;
  topicProgress: TopicProgress[];
};

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

export async function loadStudyContext(userId: string): Promise<StudyContext> {
  await ensureSyncMeta();

  const [settings, items, topics, itemTopics, userProgress, reviews] = await Promise.all([
    ensureAppSettings(userId),
    listItemsByUser(userId),
    listTopicsByUser(userId),
    listItemTopicsByUser(userId),
    listUserProgressByUser(userId),
    listReviewsByUser(userId),
  ]);

  const progressByItemId = new Map(userProgress.map((entry) => [entry.itemId, entry]));
  const gradesByItemId = buildGradesByItemId(reviews);

  return {
    settings,
    items,
    itemsById: new Map(items.map((item) => [item.id, item])),
    topics,
    topicsById: new Map(topics.map((topic) => [topic.id, topic])),
    itemTopics,
    userProgress,
    progressByItemId,
    gradesByItemId,
    topicProgress: computeAllTopicProgress({
      topics,
      itemTopics,
      progressByItemId,
      gradesByItemId,
    }),
  };
}
