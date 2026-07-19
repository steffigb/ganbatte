import { db } from '@/lib/db/database';
import { TABLE_ADAPTERS, type SyncRecord } from '@/lib/sync/recordRegistry';
import { APPEND_ONLY_TABLES, UPSERT_ON_CONFLICT } from '@/lib/sync/tables';
import type { ItemSource, ItemTopic } from '@/types/itemRelations';
import type { SyncTableName } from '@/types/sync';
import type { UserProgress } from '@/types/userProgress';
import type { AppSettings } from '@/types/appSettings';

async function getLocalByNaturalKey(
  table: SyncTableName,
  remoteRecord: SyncRecord,
): Promise<SyncRecord | undefined> {
  if (table === 'itemTopics') {
    const link = remoteRecord as ItemTopic;
    return db.itemTopics
      .where('[itemId+topicId]')
      .equals([link.itemId, link.topicId])
      .first();
  }

  if (table === 'itemSources') {
    const link = remoteRecord as ItemSource;
    return db.itemSources
      .where('[itemId+sourceId]')
      .equals([link.itemId, link.sourceId])
      .first();
  }

  if (table === 'userProgress') {
    const progress = remoteRecord as UserProgress;
    return db.userProgress
      .where('[userId+itemId]')
      .equals([progress.userId, progress.itemId])
      .first();
  }

  if (table === 'appSettings') {
    const settings = remoteRecord as AppSettings;
    return db.appSettings.where('userId').equals(settings.userId).first();
  }

  return undefined;
}

async function removeDuplicateNaturalKeyRecord(
  table: SyncTableName,
  remoteRecord: SyncRecord,
): Promise<void> {
  const existing = await getLocalByNaturalKey(table, remoteRecord);
  if (existing && existing.id !== remoteRecord.id) {
    await TABLE_ADAPTERS[table].deleteLocal(existing.id);
  }
}

export async function mergeRemoteRecord(
  table: SyncTableName,
  remoteRecord: SyncRecord,
): Promise<void> {
  const adapter = TABLE_ADAPTERS[table];

  if (UPSERT_ON_CONFLICT[table]) {
    await removeDuplicateNaturalKeyRecord(table, remoteRecord);
  }

  if (APPEND_ONLY_TABLES.has(table)) {
    const localRecord = await adapter.getLocal(remoteRecord.id);
    if (!localRecord) {
      await adapter.putLocal(remoteRecord);
    }
    return;
  }

  const localById = await adapter.getLocal(remoteRecord.id);
  const localByNaturalKey = UPSERT_ON_CONFLICT[table]
    ? await getLocalByNaturalKey(table, remoteRecord)
    : undefined;
  const localRecord = localById ?? localByNaturalKey;

  if (!localRecord || remoteRecord.updatedAt >= localRecord.updatedAt) {
    await adapter.putLocal(remoteRecord);
  }
}

export async function applyRemoteDelete(
  table: SyncTableName,
  recordId: string,
  deletedAt?: string,
): Promise<void> {
  const adapter = TABLE_ADAPTERS[table];
  const localRecord = await adapter.getLocal(recordId);

  if (!localRecord) {
    return;
  }

  if (deletedAt) {
    await adapter.putLocal({
      ...localRecord,
      deletedAt,
      updatedAt: deletedAt,
    });
    return;
  }

  await adapter.deleteLocal(recordId);
}
