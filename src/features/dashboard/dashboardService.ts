import { loadStudyContext } from '@/lib/study';
import {
  computeOverallReadiness,
  computeSkillReadiness,
  daysUntilExam,
} from '@/lib/dashboard';
import {
  buildReviewQueueFromContext,
  countDueCards,
} from '@/features/review/buildReviewQueue';
import { topNeedsAttentionTopics } from '@/lib/topicProgress';
import type { Skill } from '@/types/domain';
import type { Topic } from '@/types/topic';
import type { TopicProgress } from '@/types/topicProgress';

export type WeakTopicSummary = {
  topic: Topic;
  progress: TopicProgress;
};

export type DashboardData = {
  examDate: string;
  daysUntilExam: number;
  skillReadiness: Record<Skill, number>;
  overallReadiness: number;
  weakTopics: WeakTopicSummary[];
  queueSize: number;
  dueCount: number;
};

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const context = await loadStudyContext(userId);
  const skillReadiness = computeSkillReadiness(context);
  const weakTopicProgress = topNeedsAttentionTopics(context.topicProgress, 5);
  const queue = buildReviewQueueFromContext(context);

  const weakTopics = weakTopicProgress
    .map((progress) => {
      const topic = context.topicsById.get(progress.topicId);
      if (!topic) {
        return null;
      }

      return { topic, progress };
    })
    .filter((entry): entry is WeakTopicSummary => entry !== null);

  return {
    examDate: context.settings.examDate,
    daysUntilExam: daysUntilExam(context.settings.examDate),
    skillReadiness,
    overallReadiness: computeOverallReadiness(skillReadiness),
    weakTopics,
    queueSize: queue.length,
    dueCount: countDueCards(context),
  };
}
