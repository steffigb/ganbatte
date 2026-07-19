import type { SyncTableName } from '@/types/sync';

export const SYNC_TABLE_ORDER: SyncTableName[] = [
  'importBatches',
  'topics',
  'sources',
  'learningItems',
  'itemSources',
  'itemTopics',
  'reviews',
  'userProgress',
  'studySessions',
  'appSettings',
];

export const REMOTE_TABLE_NAMES: Record<SyncTableName, string> = {
  topics: 'topics',
  sources: 'sources',
  learningItems: 'learning_items',
  itemSources: 'item_sources',
  itemTopics: 'item_topics',
  reviews: 'reviews',
  userProgress: 'user_progress',
  studySessions: 'study_sessions',
  importBatches: 'import_batches',
  appSettings: 'app_settings',
};

export const SOFT_DELETE_TABLES = new Set<SyncTableName>(['topics', 'learningItems']);

export const APPEND_ONLY_TABLES = new Set<SyncTableName>(['reviews']);
