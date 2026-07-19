import {
  listPendingChanges,
  removePendingChange,
} from '@/lib/db/repositories/pendingChangesRepository';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getLocalRecord,
  recordToRemote,
  type SyncRecord,
} from '@/lib/sync/recordRegistry';
import { REMOTE_TABLE_NAMES, SOFT_DELETE_TABLES } from '@/lib/sync/tables';
import type { PendingChange } from '@/types/sync';

async function resolveChangeRecord(
  change: PendingChange,
): Promise<SyncRecord | undefined> {
  const local = await getLocalRecord(change.table, change.recordId);
  if (local) {
    return local;
  }

  if (change.payload && typeof change.payload === 'object') {
    return change.payload as SyncRecord;
  }

  return undefined;
}

async function pushDelete(userId: string, change: PendingChange): Promise<void> {
  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES[change.table];

  if (SOFT_DELETE_TABLES.has(change.table)) {
    const record = await resolveChangeRecord(change);
    if (!record) {
      return;
    }

    const { error } = await supabase
      .from(remoteTable)
      .upsert(recordToRemote(change.table, record));

    if (error) {
      throw new Error(`Push delete failed for ${remoteTable}: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase
    .from(remoteTable)
    .delete()
    .eq('id', change.recordId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Push delete failed for ${remoteTable}: ${error.message}`);
  }
}

async function pushUpsert(change: PendingChange): Promise<void> {
  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES[change.table];
  const record = await resolveChangeRecord(change);

  if (!record) {
    return;
  }

  const { error } = await supabase
    .from(remoteTable)
    .upsert(recordToRemote(change.table, record));

  if (error) {
    throw new Error(`Push upsert failed for ${remoteTable}: ${error.message}`);
  }
}

async function pushChange(userId: string, change: PendingChange): Promise<void> {
  if (change.operation === 'delete') {
    await pushDelete(userId, change);
    return;
  }

  await pushUpsert(change);
}

export async function pushPendingChanges(userId: string): Promise<number> {
  const pendingChanges = await listPendingChanges();
  let pushed = 0;

  for (const change of pendingChanges) {
    if (change.id === undefined) {
      continue;
    }

    await pushChange(userId, change);
    await removePendingChange(change.id);
    pushed += 1;
  }

  return pushed;
}
