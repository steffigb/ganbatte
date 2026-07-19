import { db } from '@/lib/db/database';
import {
  isNotDeleted,
  withSoftDelete,
  withTimestamps,
} from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { JlptLevel, Skill } from '@/types/domain';
import type { Topic } from '@/types/topic';

export async function getTopicById(id: string): Promise<Topic | undefined> {
  const topic = await db.topics.get(id);
  return topic && isNotDeleted(topic) ? topic : undefined;
}

export async function listTopicsByUser(userId: string): Promise<Topic[]> {
  const topics = await db.topics
    .where('userId')
    .equals(userId)
    .filter(isNotDeleted)
    .toArray();

  return topics.sort(
    (a, b) =>
      (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name),
  );
}

export async function listTopicsBySkill(
  userId: string,
  level: JlptLevel,
  skill: Skill,
): Promise<Topic[]> {
  return db.topics
    .where('[userId+level+skill]')
    .equals([userId, level, skill])
    .filter(isNotDeleted)
    .toArray();
}

export async function upsertTopic(topic: Topic): Promise<string> {
  const existing = await db.topics.get(topic.id);
  const record = withTimestamps(topic, existing);

  await db.topics.put(record);
  await enqueuePendingChange('topics', record.id, existing ? 'update' : 'insert', record);

  return record.id;
}

export async function softDeleteTopic(id: string): Promise<void> {
  const existing = await db.topics.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const record = withSoftDelete(existing);
  await db.topics.put(record);
  await enqueuePendingChange('topics', id, 'delete', record);
}
