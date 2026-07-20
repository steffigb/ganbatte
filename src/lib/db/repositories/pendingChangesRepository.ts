import { db } from '@/lib/db/database';
import { ensureSyncMeta } from '@/lib/db/deviceId';
import { nowIso } from '@/lib/db/repositories/helpers';
import { SYNC_TABLE_ORDER } from '@/lib/sync/tables';
import type {
  PendingChange,
  PendingChangeOperation,
  SyncStatus,
  SyncTableName,
} from '@/types/sync';

const TABLE_PUSH_ORDER = new Map(SYNC_TABLE_ORDER.map((table, index) => [table, index]));

function sortPendingChanges(changes: PendingChange[]): PendingChange[] {
  return [...changes].sort((left, right) => {
    const leftOrder = TABLE_PUSH_ORDER.get(left.table) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = TABLE_PUSH_ORDER.get(right.table) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

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
  const changes = await db.pendingChanges.orderBy('createdAt').toArray();
  return sortPendingChanges(changes);
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
