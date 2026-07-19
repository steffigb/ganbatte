import { db } from '@/lib/db/database';
import {
  isNotDeleted,
  withSoftDelete,
  withTimestamps,
} from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { ItemType, JlptLevel, Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';

export async function getItemById(id: string): Promise<LearningItem | undefined> {
  const item = await db.learningItems.get(id);
  return item && isNotDeleted(item) ? item : undefined;
}

export async function listItemsByUser(userId: string): Promise<LearningItem[]> {
  return db.learningItems
    .where('userId')
    .equals(userId)
    .filter(isNotDeleted)
    .toArray();
}

export async function listItemsBySkill(
  userId: string,
  level: JlptLevel,
  skill: Skill,
): Promise<LearningItem[]> {
  return db.learningItems
    .where('[userId+level+skill]')
    .equals([userId, level, skill])
    .filter(isNotDeleted)
    .toArray();
}

export async function findItemByJapanese(
  userId: string,
  type: ItemType,
  japanese: string,
): Promise<LearningItem | undefined> {
  const item = await db.learningItems
    .where('[userId+japanese+type]')
    .equals([userId, japanese, type])
    .first();

  return item && isNotDeleted(item) ? item : undefined;
}

export async function upsertItem(item: LearningItem): Promise<string> {
  const existing = await db.learningItems.get(item.id);
  const record = withTimestamps(item, existing);

  await db.learningItems.put(record);
  await enqueuePendingChange(
    'learningItems',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function softDeleteItem(id: string): Promise<void> {
  const existing = await db.learningItems.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const record = withSoftDelete(existing);
  await db.learningItems.put(record);
  await enqueuePendingChange('learningItems', id, 'delete', record);
}
