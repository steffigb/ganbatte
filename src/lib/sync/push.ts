import {
  listPendingChanges,
  removePendingChange,
} from '@/lib/db/repositories/pendingChangesRepository';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getLocalRecord,
  recordFromRemote,
  recordToRemote,
  TABLE_ADAPTERS,
  type SyncRecord,
} from '@/lib/sync/recordRegistry';
import {
  REMOTE_TABLE_NAMES,
  SOFT_DELETE_TABLES,
  UPSERT_ON_CONFLICT,
} from '@/lib/sync/tables';
import type { PendingChange, SyncTableName } from '@/types/sync';
import type { ItemSource, ItemTopic } from '@/types/itemRelations';
import type { UserProgress } from '@/types/userProgress';
import type { AppSettings } from '@/types/appSettings';

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

function upsertOptions(table: SyncTableName) {
  const onConflict = UPSERT_ON_CONFLICT[table];
  return onConflict ? { onConflict } : undefined;
}

async function reconcileNaturalKeyRecord(
  table: SyncTableName,
  localRecord: SyncRecord,
  remoteRow: Record<string, unknown>,
): Promise<void> {
  const remoteId = String(remoteRow.id);
  if (remoteId === localRecord.id) {
    return;
  }

  const adapter = TABLE_ADAPTERS[table];
  await adapter.deleteLocal(localRecord.id);
  await adapter.putLocal(recordFromRemote(table, remoteRow));
}

async function remoteRowByNaturalKey(
  table: SyncTableName,
  record: SyncRecord,
): Promise<Record<string, unknown> | undefined> {
  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES[table];

  if (table === 'itemTopics') {
    const link = record as ItemTopic;
    const { data, error } = await supabase
      .from(remoteTable)
      .select('*')
      .eq('item_id', link.itemId)
      .eq('topic_id', link.topicId)
      .maybeSingle();

    if (error) {
      throw new Error(`Push reconcile failed for ${remoteTable}: ${error.message}`);
    }

    return data ?? undefined;
  }

  if (table === 'itemSources') {
    const link = record as ItemSource;
    const { data, error } = await supabase
      .from(remoteTable)
      .select('*')
      .eq('item_id', link.itemId)
      .eq('source_id', link.sourceId)
      .maybeSingle();

    if (error) {
      throw new Error(`Push reconcile failed for ${remoteTable}: ${error.message}`);
    }

    return data ?? undefined;
  }

  if (table === 'userProgress') {
    const progress = record as UserProgress;
    const { data, error } = await supabase
      .from(remoteTable)
      .select('*')
      .eq('user_id', progress.userId)
      .eq('item_id', progress.itemId)
      .maybeSingle();

    if (error) {
      throw new Error(`Push reconcile failed for ${remoteTable}: ${error.message}`);
    }

    return data ?? undefined;
  }

  if (table === 'appSettings') {
    const settings = record as AppSettings;
    const { data, error } = await supabase
      .from(remoteTable)
      .select('*')
      .eq('user_id', settings.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Push reconcile failed for ${remoteTable}: ${error.message}`);
    }

    return data ?? undefined;
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
      .upsert(recordToRemote(change.table, record), upsertOptions(change.table));

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

/**
 * `paired_item_id` is a self-referential FK on `learning_items`. Because
 * `resolveChangeRecord` always reads the item's *current* local state (not a
 * point-in-time snapshot), even an item's original "insert" pending change
 * can carry an already-resolved `pairedItemId` pointing at a counterpart verb
 * that hasn't been pushed yet — violating the FK. To avoid ordering the whole
 * batch by dependency, every learningItems upsert pushes with
 * `paired_item_id` cleared, and any pairing is deferred into `pairings` to be
 * applied in a second pass once every item in the batch is guaranteed to
 * exist remotely (see `applyDeferredPairings`).
 */
async function pushUpsert(
  change: PendingChange,
  pairings: Map<string, string>,
): Promise<void> {
  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES[change.table];
  const record = await resolveChangeRecord(change);

  if (!record) {
    return;
  }

  const remoteRow = recordToRemote(change.table, record);

  if (change.table === 'learningItems' && typeof remoteRow.paired_item_id === 'string') {
    pairings.set(record.id, remoteRow.paired_item_id);
    remoteRow.paired_item_id = null;
  }

  const options = upsertOptions(change.table);
  const { error } = await supabase.from(remoteTable).upsert(remoteRow, options);

  if (error) {
    throw new Error(`Push upsert failed for ${remoteTable}: ${error.message}`);
  }

  if (UPSERT_ON_CONFLICT[change.table]) {
    const remoteRowResult = await remoteRowByNaturalKey(change.table, record);
    if (remoteRowResult) {
      await reconcileNaturalKeyRecord(change.table, record, remoteRowResult);
    }
  }
}

async function pushChange(
  userId: string,
  change: PendingChange,
  pairings: Map<string, string>,
): Promise<void> {
  if (change.operation === 'delete') {
    await pushDelete(userId, change);
    return;
  }

  await pushUpsert(change, pairings);
}

async function applyDeferredPairings(
  userId: string,
  pairings: Map<string, string>,
): Promise<void> {
  if (pairings.size === 0) {
    return;
  }

  const supabase = getSupabaseClient();
  const remoteTable = REMOTE_TABLE_NAMES.learningItems;

  for (const [itemId, pairedItemId] of pairings) {
    const { error } = await supabase
      .from(remoteTable)
      .update({ paired_item_id: pairedItemId })
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Push pairing update failed for ${remoteTable}: ${error.message}`);
    }
  }
}

export async function pushPendingChanges(userId: string): Promise<number> {
  const pendingChanges = await listPendingChanges();
  const pairings = new Map<string, string>();
  let pushed = 0;

  for (const change of pendingChanges) {
    if (change.id === undefined) {
      continue;
    }

    await pushChange(userId, change, pairings);
    await removePendingChange(change.id);
    pushed += 1;
  }

  await applyDeferredPairings(userId, pairings);

  return pushed;
}
