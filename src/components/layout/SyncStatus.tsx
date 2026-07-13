export function SyncStatus() {
  return (
    <span
      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      title="Sync not configured yet"
    >
      Offline · sync pending
    </span>
  );
}
