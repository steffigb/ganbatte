import { Button } from '@/components/ui/Button';
import { useSync } from '@/features/sync';

function formatLastSync(lastSyncAt?: string): string {
  if (!lastSyncAt) {
    return 'Never synced';
  }

  const syncedAt = new Date(lastSyncAt);
  const diffMs = Date.now() - syncedAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'Synced just now';
  }

  if (diffMinutes < 60) {
    return `Synced ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Synced ${diffHours}h ago`;
  }

  return `Synced ${syncedAt.toLocaleDateString()}`;
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
