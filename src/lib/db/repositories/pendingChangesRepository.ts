import { db } from '@/lib/db/database';
import { ensureSyncMeta } from '@/lib/db/deviceId';
import { nowIso } from '@/lib/db/repositories/helpers';
import type {
  PendingChange,
  PendingChangeOperation,
  SyncStatus,
  SyncTableName,
} from '@/types/sync';

async function refreshPendingChangeCount(): Promise<number> {
  const count = await db.pendingChanges.count();
  const meta = await ensureSyncMeta();

  await db.syncMeta.put({
    ...meta,
    pendingChangeCount: count,
  });

  return count;
}

export async function enqueuePendingChange(
  table: SyncTableName,
  recordId: string,
  operation: PendingChangeOperation,
  payload?: unknown,
): Promise<number> {
  const change: PendingChange = {
    table,
    recordId,
    operation,
    payload,
    createdAt: nowIso(),
  };

  const id = await db.pendingChanges.add(change);
  await refreshPendingChangeCount();
  return id ?? 0;
}

export async function listPendingChanges(): Promise<PendingChange[]> {
  return db.pendingChanges.orderBy('createdAt').toArray();
}

export async function countPendingChanges(): Promise<number> {
  return db.pendingChanges.count();
}

export async function removePendingChange(id: number): Promise<void> {
  await db.pendingChanges.delete(id);
  await refreshPendingChangeCount();
}

export async function clearPendingChanges(): Promise<void> {
  await db.pendingChanges.clear();
  await refreshPendingChangeCount();
}

export async function updateSyncMeta(partial: {
  lastSyncAt?: string;
  lastSyncStatus?: SyncStatus;
}): Promise<void> {
  const meta = await ensureSyncMeta();
  const pendingChangeCount = await db.pendingChanges.count();

  await db.syncMeta.put({
    ...meta,
    ...partial,
    pendingChangeCount,
  });
}

export async function getSyncMeta() {
  return ensureSyncMeta();
}
