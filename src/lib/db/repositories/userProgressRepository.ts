import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { UserProgress } from '@/types/userProgress';

export async function getUserProgressById(
  id: string,
): Promise<UserProgress | undefined> {
  return db.userProgress.get(id);
}

export async function getUserProgressByItem(
  userId: string,
  itemId: string,
): Promise<UserProgress | undefined> {
  return db.userProgress
    .where('[userId+itemId]')
    .equals([userId, itemId])
    .first();
}

export async function listDueProgress(
  userId: string,
  before: string = new Date().toISOString(),
): Promise<UserProgress[]> {
  return db.userProgress
    .where('[userId+nextReviewAt]')
    .between([userId, ''], [userId, before], true, true)
    .toArray();
}

export async function upsertUserProgress(
  progress: UserProgress,
): Promise<string> {
  const existing = await db.userProgress.get(progress.id);
  const record = withTimestamps(progress, existing);

  await db.userProgress.put(record);
  await enqueuePendingChange(
    'userProgress',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteUserProgress(id: string): Promise<void> {
  const existing = await db.userProgress.get(id);
  if (!existing) {
    return;
  }

  await db.userProgress.delete(id);
  await enqueuePendingChange('userProgress', id, 'delete');
}
