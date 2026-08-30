import { getSupabaseClient } from '@/lib/supabase/client';
import { mergeRemoteRecord } from '@/lib/sync/mergeLocal';
import { recordFromRemote } from '@/lib/sync/recordRegistry';
import { REMOTE_TABLE_NAMES, SYNC_TABLE_ORDER } from '@/lib/sync/tables';
import type { SyncTableName } from '@/types/sync';

type RemoteRow = Record<string, unknown>;

/**
 * Matches Supabase's PostgREST `max_rows` cap (see `supabase/config.toml`).
 * A single unpaginated `select('*')` silently truncates past that cap, and
 * since the caller advances `lastSyncAt` right after, any rows missed by a
 * truncated page would never be fetched again. Ordering by `id` (a UUID, so
 * effectively random) gives a stable sort for `.range()` paging without
 * depending on `updated_at`, which can tie or change mid-pagination.
 */
const PAGE_SIZE = 1000;

async function pullTable(
  userId: string,
  table: SyncTableName,
  lastSyncAt?: string,
): Promise<number> {
  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES[table];

  let total = 0;
  let offset = 0;

  for (;;) {
    let query = supabase
      .from(remoteTable)
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

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

    total += rows.length;

    if (rows.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return total;
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
