import { getSupabaseClient } from '@/lib/supabase/client';
import { mergeRemoteRecord } from '@/lib/sync/mergeLocal';
import { recordFromRemote } from '@/lib/sync/recordRegistry';
import { REMOTE_TABLE_NAMES, SYNC_TABLE_ORDER } from '@/lib/sync/tables';
import type { SyncTableName } from '@/types/sync';

type RemoteRow = Record<string, unknown>;

async function pullTable(
  userId: string,
  table: SyncTableName,
  lastSyncAt?: string,
): Promise<number> {
  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES[table];

  let query = supabase.from(remoteTable).select('*').eq('user_id', userId);

  if (lastSyncAt) {
    query = query.gt('updated_at', lastSyncAt);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Pull failed for ${remoteTable}: ${error.message}`);
  }

  const rows = (data ?? []) as RemoteRow[];

  for (const row of rows) {
    const record = recordFromRemote(table, row);
    await mergeRemoteRecord(table, record);
  }

  return rows.length;
}

export async function pullRemoteChanges(
  userId: string,
  lastSyncAt?: string,
): Promise<number> {
  let total = 0;

  for (const table of SYNC_TABLE_ORDER) {
    total += await pullTable(userId, table, lastSyncAt);
  }

  return total;
}
