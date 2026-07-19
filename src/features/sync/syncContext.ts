import { createContext } from 'react';
import type { SyncStatus } from '@/types/sync';

export type SyncContextValue = {
  isConfigured: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  pendingCount: number;
  status: SyncStatus;
  error: string | null;
  syncNow: () => Promise<void>;
};

export const SyncContext = createContext<SyncContextValue | null>(null);
