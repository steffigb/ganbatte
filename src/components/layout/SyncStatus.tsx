import { Button } from '@/components/ui/Button';
import { useSync } from '@/features/sync';
import { formatRelativeTime } from '@/utils/date';

function formatLastSync(lastSyncAt?: string): string {
  return lastSyncAt ? `Synced ${formatRelativeTime(lastSyncAt)}` : 'Never synced';
}

export function SyncStatus() {
  const {
    isConfigured,
    isOnline,
    isSyncing,
    lastSyncAt,
    pendingCount,
    status,
    error,
    syncNow,
  } = useSync();

  if (!isConfigured) {
    return (
      <span
        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        title="Add Supabase env vars to enable sync"
      >
        Sync not configured
      </span>
    );
  }

  const label = isSyncing
    ? 'Syncing…'
    : !isOnline
      ? pendingCount > 0
        ? `Offline · ${pendingCount} pending`
        : 'Offline'
      : status === 'error'
        ? 'Sync failed'
        : pendingCount > 0
          ? `${pendingCount} pending`
          : formatLastSync(lastSyncAt);

  const title = error ?? (pendingCount > 0 ? `${pendingCount} local changes waiting to sync` : undefined);

  return (
    <div className="flex items-center gap-2">
      <span
        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        title={title}
      >
        {label}
      </span>
      <Button
        type="button"
        className="px-2 py-1 text-xs"
        disabled={isSyncing || !isOnline}
        onClick={() => void syncNow()}
      >
        Sync now
      </Button>
    </div>
  );
}
