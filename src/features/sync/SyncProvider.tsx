import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SyncContext, type SyncContextValue } from '@/features/sync/syncContext';
import { countPendingChanges, getSyncMeta } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  forceFullResync as runForceFullResync,
  isOnline,
  runSync,
  type SyncResult,
} from '@/lib/sync';
import type { SyncStatus } from '@/types/sync';

type SyncProviderProps = {
  children: ReactNode;
};

export function SyncProvider({ children }: SyncProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isConfigured = isSupabaseConfigured();
  const [online, setOnline] = useState(isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | undefined>();
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState<SyncStatus>('offline');
  const [error, setError] = useState<string | null>(null);
  const hasSyncedOnLoginRef = useRef(false);

  const refreshStatus = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    const [meta, pending] = await Promise.all([getSyncMeta(), countPendingChanges()]);
    setLastSyncAt(meta.lastSyncAt);
    setPendingCount(pending);
    setStatus(meta.lastSyncStatus);
  }, [isConfigured]);

  const executeSync = useCallback(
    async (run: (userId: string) => Promise<SyncResult>) => {
      if (!user || !isConfigured) {
        return;
      }

      if (!isOnline()) {
        setOnline(false);
        setStatus('offline');
        setError('Cannot sync while offline');
        return;
      }

      setIsSyncing(true);
      setError(null);

      try {
        const result = await run(user.id);
        setLastSyncAt(result.lastSyncAt);
        setPendingCount(result.pending);
        setStatus('ok');
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Sync failed';
        setError(message);
        setStatus(message.includes('offline') ? 'offline' : 'error');
        await refreshStatus();
      } finally {
        setIsSyncing(false);
      }
    },
    [user, isConfigured, refreshStatus],
  );

  const syncNow = useCallback(() => executeSync(runSync), [executeSync]);
  const forceFullResync = useCallback(
    () => executeSync(runForceFullResync),
    [executeSync],
  );

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      setError(null);
      if (user && isConfigured) {
        void syncNow();
      }
    }

    function handleOffline() {
      setOnline(false);
      setStatus('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, isConfigured, syncNow]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    let cancelled = false;

    void (async () => {
      await refreshStatus();
    })();

    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        void refreshStatus();
      }
    }, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isConfigured, refreshStatus]);

  useEffect(() => {
    if (!user) {
      hasSyncedOnLoginRef.current = false;
      return;
    }

    if (isAuthLoading || !isConfigured || hasSyncedOnLoginRef.current) {
      return;
    }

    hasSyncedOnLoginRef.current = true;
    void syncNow();
  }, [user, isAuthLoading, isConfigured, syncNow]);

  const value = useMemo<SyncContextValue>(
    () => ({
      isConfigured,
      isOnline: online,
      isSyncing,
      lastSyncAt,
      pendingCount,
      status,
      error,
      syncNow,
      forceFullResync,
    }),
    [
      isConfigured,
      online,
      isSyncing,
      lastSyncAt,
      pendingCount,
      status,
      error,
      syncNow,
      forceFullResync,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
