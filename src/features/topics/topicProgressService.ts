import { loadStudyContext } from '@/lib/study';
import type { TopicProgress } from '@/types/topicProgress';

export async function loadTopicProgressForUser(userId: string): Promise<TopicProgress[]> {
  const context = await loadStudyContext(userId);
  return context.topicProgress;
}

export async function getTopicProgressByTopicId(
  userId: string,
  topicId: string,
): Promise<TopicProgress | undefined> {
  const progress = await loadTopicProgressForUser(userId);
  return progress.find((entry) => entry.topicId === topicId);
}
