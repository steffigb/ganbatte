export type SyncStatus = 'ok' | 'error' | 'offline' | 'pending';

export type SyncTableName =
  | 'topics'
  | 'sources'
  | 'learningItems'
  | 'itemSources'
  | 'itemTopics'
  | 'reviews'
  | 'userProgress'
  | 'studySessions'
  | 'importBatches'
  | 'appSettings';

export type PendingChangeOperation = 'insert' | 'update' | 'delete';

export interface SyncMeta {
  id: string;
  deviceId: string;
  lastSyncAt?: string;
  lastSyncStatus: SyncStatus;
  pendingChangeCount: number;
  schemaVersion: number;
}

export interface PendingChange {
  id?: number;
  table: SyncTableName;
  recordId: string;
  operation: PendingChangeOperation;
  payload?: unknown;
  createdAt: string;
}
