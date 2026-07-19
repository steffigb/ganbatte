import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { ItemTopic } from '@/types/itemRelations';

export async function listItemTopicsByItem(itemId: string): Promise<ItemTopic[]> {
  return db.itemTopics.where('itemId').equals(itemId).toArray();
}

export async function listItemTopicsByTopic(
  topicId: string,
): Promise<ItemTopic[]> {
  return db.itemTopics.where('topicId').equals(topicId).toArray();
}

export async function findItemTopicLink(
  itemId: string,
  topicId: string,
): Promise<ItemTopic | undefined> {
  return db.itemTopics
    .where('[itemId+topicId]')
    .equals([itemId, topicId])
    .first();
}

export async function upsertItemTopic(link: ItemTopic): Promise<string> {
  const existing = await db.itemTopics.get(link.id);
  const record = withTimestamps(link, existing);

  await db.itemTopics.put(record);
  await enqueuePendingChange(
    'itemTopics',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteItemTopic(id: string): Promise<void> {
  const existing = await db.itemTopics.get(id);
  if (!existing) {
    return;
  }

  await db.itemTopics.delete(id);
  await enqueuePendingChange('itemTopics', id, 'delete');
}
