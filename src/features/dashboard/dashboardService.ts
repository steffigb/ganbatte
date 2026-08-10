import { loadStudyContext } from '@/lib/study';
import {
  computeMasteryCounts,
  computeOverallReadiness,
  computeSkillReadiness,
  daysUntilExam,
  type MasteryCounts,
} from '@/lib/dashboard';
import {
  buildReviewQueueFromContext,
  countDueCards,
} from '@/features/review/buildReviewQueue';
import { buildLessonQueueForGroup } from '@/features/learn/lessonService';
import { learnHubGroups } from '@/features/learn/learnHubService';
import { getActivityMinutesThisWeek } from '@/features/activity/activityService';
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
  masteryCounts: MasteryCounts;
  weakTopics: WeakTopicSummary[];
  queueSize: number;
  dueCount: number;
  lessonsAvailable: number;
  readingListeningMinutesThisWeek: number;
};

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const context = await loadStudyContext(userId);
  const skillReadiness = computeSkillReadiness(context);
  const masteryCounts = computeMasteryCounts(context);
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

  const lessonsAvailable = learnHubGroups.reduce(
    (sum, group) => sum + buildLessonQueueForGroup(context, group).length,
    0,
  );
  const readingListeningMinutesThisWeek = await getActivityMinutesThisWeek(userId);

  return {
    examDate: context.settings.examDate,
    daysUntilExam: daysUntilExam(context.settings.examDate),
    skillReadiness,
    overallReadiness: computeOverallReadiness(skillReadiness),
    masteryCounts,
    weakTopics,
    queueSize: queue.length,
    dueCount: countDueCards(context),
    lessonsAvailable,
    readingListeningMinutesThisWeek,
  };
}
