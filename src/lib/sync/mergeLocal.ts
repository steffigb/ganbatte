import { TABLE_ADAPTERS, type SyncRecord } from '@/lib/sync/recordRegistry';
import { APPEND_ONLY_TABLES } from '@/lib/sync/tables';
import type { SyncTableName } from '@/types/sync';

export async function mergeRemoteRecord(
  table: SyncTableName,
  remoteRecord: SyncRecord,
): Promise<void> {
  const adapter = TABLE_ADAPTERS[table];
  const localRecord = await adapter.getLocal(remoteRecord.id);

  if (APPEND_ONLY_TABLES.has(table)) {
    if (!localRecord) {
      await adapter.putLocal(remoteRecord);
    }
    return;
  }

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
