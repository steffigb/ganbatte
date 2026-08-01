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

/**
 * Finds an item by (userId, type, japanese). When `reading` is provided, it is
 * also required to match exactly — this disambiguates homographs that share
 * the same kanji spelling but have different readings (e.g. 一日 いちにち vs
 * ついたち), so they are treated as distinct items rather than duplicates.
 * When `reading` is omitted, the first match by (userId, type, japanese) is
 * returned regardless of reading (used where no reading is known, e.g.
 * resolving a paired verb by its Japanese text only).
 */
export async function findItemByJapanese(
  userId: string,
  type: ItemType,
  japanese: string,
  reading?: string,
): Promise<LearningItem | undefined> {
  const candidates = (
    await db.learningItems
      .where('[userId+japanese+type]')
      .equals([userId, japanese, type])
      .toArray()
  ).filter(isNotDeleted);

  if (reading === undefined) {
    return candidates[0];
  }

  const normalizedReading = reading.trim();
  return candidates.find((item) => (item.reading ?? '').trim() === normalizedReading);
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
