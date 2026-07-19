import { useContext } from 'react';
import { SyncContext } from '@/features/sync/syncContext';

export function useSync() {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }

  return context;
}
