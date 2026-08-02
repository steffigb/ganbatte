export { db, GanbatteDB } from '@/lib/db/database';
export {
  DB_NAME,
  DB_SCHEMA_VERSION,
  SYNC_META_ID,
} from '@/lib/db/constants';
export {
  createDeviceId,
  ensureSyncMeta,
  getDeviceId,
} from '@/lib/db/deviceId';

export * from '@/lib/db/repositories/topicRepository';
export * from '@/lib/db/repositories/sourceRepository';
export * from '@/lib/db/repositories/itemRepository';
export * from '@/lib/db/repositories/itemSourceRepository';
export * from '@/lib/db/repositories/itemTopicRepository';
export * from '@/lib/db/repositories/kanjiCompoundLookup';
export * from '@/lib/db/repositories/exampleReferenceLookup';
export * from '@/lib/db/repositories/pairedItemLookup';
export * from '@/lib/db/repositories/reviewRepository';
export * from '@/lib/db/repositories/userProgressRepository';
export * from '@/lib/db/repositories/studySessionRepository';
export * from '@/lib/db/repositories/importBatchRepository';
export * from '@/lib/db/repositories/appSettingsRepository';
export * from '@/lib/db/repositories/pendingChangesRepository';
