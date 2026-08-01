import { listStudySessionsByUser, upsertStudySession } from '@/lib/db';
import type { Skill } from '@/types/domain';
import type { StudySession } from '@/types/studySession';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export type LogActivityInput = {
  skill: Extract<Skill, 'reading' | 'listening'>;
  durationMinutes: number;
  topicId?: string;
  itemId?: string;
  notes?: string;
};

/**
 * Reading/listening practice is tracked as a lightweight session log rather
 * than SRS review — these skills are excluded from spaced repetition
 * (see SRS_ITEM_TYPES), so "did I practice" is the meaningful signal here.
 */
export async function logActivitySession(
  userId: string,
  input: LogActivityInput,
): Promise<StudySession> {
  const timestamp = nowIso();
  const session: StudySession = {
    id: createId(),
    userId,
    startedAt: timestamp,
    endedAt: timestamp,
    durationMinutes: input.durationMinutes,
    skills: [input.skill],
    topicIds: input.topicId ? [input.topicId] : [],
    itemsReviewed: input.itemId ? 1 : 0,
    notes: input.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await upsertStudySession(session);
  return session;
}

function startOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - diffToMonday);
  return monday.toISOString();
}

export async function getActivityMinutesThisWeek(
  userId: string,
  skills: Skill[] = ['reading', 'listening'],
): Promise<number> {
  const sessions = await listStudySessionsByUser(userId);
  const weekStart = startOfWeekIso();

  return sessions
    .filter((session) => session.startedAt >= weekStart)
    .filter((session) => session.skills.some((skill) => skills.includes(skill)))
    .reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0);
}
