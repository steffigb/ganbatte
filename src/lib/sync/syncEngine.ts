import { ensureSyncMeta } from '@/lib/db/deviceId';
import {
  countPendingChanges,
  getSyncMeta,
  resetSyncCursor,
  updateSyncMeta,
} from '@/lib/db/repositories/pendingChangesRepository';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { pullRemoteChanges } from '@/lib/sync/pull';
import { pushPendingChanges } from '@/lib/sync/push';
import { nowIso } from '@/utils/date';

export type SyncResult = {
  pulled: number;
  pushed: number;
  pending: number;
  lastSyncAt: string;
};

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export async function runSync(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  if (!isOnline()) {
    await ensureSyncMeta();
    await updateSyncMeta({ lastSyncStatus: 'offline' });
    throw new Error('Device is offline');
  }

  await ensureSyncMeta();
  const meta = await getSyncMeta();
  const lastSyncAt = meta.lastSyncAt;

  await updateSyncMeta({ lastSyncStatus: 'pending' });

  try {
    const pulled = await pullRemoteChanges(userId, lastSyncAt);
    const pushed = await pushPendingChanges(userId);
    const syncedAt = nowIso();

    await updateSyncMeta({
      lastSyncAt: syncedAt,
      lastSyncStatus: 'ok',
    });

    const pending = await countPendingChanges();

    return {
      pulled,
      pushed,
      pending,
      lastSyncAt: syncedAt,
    };
  } catch (cause) {
    await updateSyncMeta({ lastSyncStatus: 'error' });
    throw cause;
  }
}

export async function forceFullResync(userId: string): Promise<SyncResult> {
  await resetSyncCursor();
  return runSync(userId);
}
