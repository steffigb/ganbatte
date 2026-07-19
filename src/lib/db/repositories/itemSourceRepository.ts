import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { ItemSource } from '@/types/itemRelations';

export async function getItemSourceById(
  id: string,
): Promise<ItemSource | undefined> {
  return db.itemSources.get(id);
}

export async function listItemSourcesByItem(
  itemId: string,
): Promise<ItemSource[]> {
  return db.itemSources.where('itemId').equals(itemId).toArray();
}

export async function listItemSourcesBySource(
  sourceId: string,
): Promise<ItemSource[]> {
  return db.itemSources.where('sourceId').equals(sourceId).toArray();
}

export async function findItemSourceLink(
  itemId: string,
  sourceId: string,
): Promise<ItemSource | undefined> {
  return db.itemSources
    .where('[itemId+sourceId]')
    .equals([itemId, sourceId])
    .first();
}

export async function upsertItemSource(link: ItemSource): Promise<string> {
  const existing = await db.itemSources.get(link.id);
  const record = withTimestamps(link, existing);

  await db.itemSources.put(record);
  await enqueuePendingChange(
    'itemSources',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteItemSource(id: string): Promise<void> {
  const existing = await db.itemSources.get(id);
  if (!existing) {
    return;
  }

  await db.itemSources.delete(id);
  await enqueuePendingChange('itemSources', id, 'delete');
}
