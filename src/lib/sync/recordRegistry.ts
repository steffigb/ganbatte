import { db } from '@/lib/db/database';
import type { AppSettings } from '@/types/appSettings';
import type { ImportBatch } from '@/types/importBatch';
import type { ItemExample } from '@/types/itemExample';
import type { ItemSource, ItemTopic } from '@/types/itemRelations';
import type { LearningItem } from '@/types/learningItem';
import type { Review } from '@/types/review';
import type { Source } from '@/types/source';
import type { StudySession } from '@/types/studySession';
import type { SyncTableName } from '@/types/sync';
import type { Topic } from '@/types/topic';
import type { UserProgress } from '@/types/userProgress';
import {
  appSettingsFromRemote,
  appSettingsToRemote,
  importBatchFromRemote,
  importBatchToRemote,
  itemSourceFromRemote,
  itemSourceToRemote,
  itemTopicFromRemote,
  itemTopicToRemote,
  itemExampleFromRemote,
  itemExampleToRemote,
  learningItemFromRemote,
  learningItemToRemote,
  reviewFromRemote,
  reviewToRemote,
  sourceFromRemote,
  sourceToRemote,
  studySessionFromRemote,
  studySessionToRemote,
  topicFromRemote,
  topicToRemote,
  userProgressFromRemote,
  userProgressToRemote,
} from '@/lib/sync/mappers';

export type SyncRecord =
  | Topic
  | Source
  | LearningItem
  | ItemSource
  | ItemTopic
  | ItemExample
  | Review
  | UserProgress
  | StudySession
  | ImportBatch
  | AppSettings;

type RemoteRow = Record<string, unknown>;

type TableAdapter = {
  getLocal: (id: string) => Promise<SyncRecord | undefined>;
  putLocal: (record: SyncRecord) => Promise<void>;
  deleteLocal: (id: string) => Promise<void>;
  fromRemote: (row: RemoteRow) => SyncRecord;
  toRemote: (record: SyncRecord) => RemoteRow;
};

export const TABLE_ADAPTERS: Record<SyncTableName, TableAdapter> = {
  topics: {
    getLocal: (id) => db.topics.get(id),
    putLocal: async (record) => {
      await db.topics.put(record as Topic);
    },
    deleteLocal: (id) => db.topics.delete(id),
    fromRemote: topicFromRemote,
    toRemote: (record) => topicToRemote(record as Topic),
  },
  sources: {
    getLocal: (id) => db.sources.get(id),
    putLocal: async (record) => {
      await db.sources.put(record as Source);
    },
    deleteLocal: (id) => db.sources.delete(id),
    fromRemote: sourceFromRemote,
    toRemote: (record) => sourceToRemote(record as Source),
  },
  learningItems: {
    getLocal: (id) => db.learningItems.get(id),
    putLocal: async (record) => {
      await db.learningItems.put(record as LearningItem);
    },
    deleteLocal: (id) => db.learningItems.delete(id),
    fromRemote: learningItemFromRemote,
    toRemote: (record) => learningItemToRemote(record as LearningItem),
  },
  itemSources: {
    getLocal: (id) => db.itemSources.get(id),
    putLocal: async (record) => {
      await db.itemSources.put(record as ItemSource);
    },
    deleteLocal: (id) => db.itemSources.delete(id),
    fromRemote: itemSourceFromRemote,
    toRemote: (record) => itemSourceToRemote(record as ItemSource),
  },
  itemTopics: {
    getLocal: (id) => db.itemTopics.get(id),
    putLocal: async (record) => {
      await db.itemTopics.put(record as ItemTopic);
    },
    deleteLocal: (id) => db.itemTopics.delete(id),
    fromRemote: itemTopicFromRemote,
    toRemote: (record) => itemTopicToRemote(record as ItemTopic),
  },
  itemExamples: {
    getLocal: (id) => db.itemExamples.get(id),
    putLocal: async (record) => {
      await db.itemExamples.put(record as ItemExample);
    },
    deleteLocal: (id) => db.itemExamples.delete(id),
    fromRemote: itemExampleFromRemote,
    toRemote: (record) => itemExampleToRemote(record as ItemExample),
  },
  reviews: {
    getLocal: (id) => db.reviews.get(id),
    putLocal: async (record) => {
      await db.reviews.put(record as Review);
    },
    deleteLocal: (id) => db.reviews.delete(id),
    fromRemote: reviewFromRemote,
    toRemote: (record) => reviewToRemote(record as Review),
  },
  userProgress: {
    getLocal: (id) => db.userProgress.get(id),
    putLocal: async (record) => {
      await db.userProgress.put(record as UserProgress);
    },
    deleteLocal: (id) => db.userProgress.delete(id),
    fromRemote: userProgressFromRemote,
    toRemote: (record) => userProgressToRemote(record as UserProgress),
  },
  studySessions: {
    getLocal: (id) => db.studySessions.get(id),
    putLocal: async (record) => {
      await db.studySessions.put(record as StudySession);
    },
    deleteLocal: (id) => db.studySessions.delete(id),
    fromRemote: studySessionFromRemote,
    toRemote: (record) => studySessionToRemote(record as StudySession),
  },
  importBatches: {
    getLocal: (id) => db.importBatches.get(id),
    putLocal: async (record) => {
      await db.importBatches.put(record as ImportBatch);
    },
    deleteLocal: (id) => db.importBatches.delete(id),
    fromRemote: importBatchFromRemote,
    toRemote: (record) => importBatchToRemote(record as ImportBatch),
  },
  appSettings: {
    getLocal: (id) => db.appSettings.get(id),
    putLocal: async (record) => {
      await db.appSettings.put(record as AppSettings);
    },
    deleteLocal: (id) => db.appSettings.delete(id),
    fromRemote: appSettingsFromRemote,
    toRemote: (record) => appSettingsToRemote(record as AppSettings),
  },
};

export async function getLocalRecord(
  table: SyncTableName,
  id: string,
): Promise<SyncRecord | undefined> {
  return TABLE_ADAPTERS[table].getLocal(id);
}

export function recordFromRemote(table: SyncTableName, row: RemoteRow): SyncRecord {
  return TABLE_ADAPTERS[table].fromRemote(row);
}

export function recordToRemote(table: SyncTableName, record: SyncRecord): RemoteRow {
  return TABLE_ADAPTERS[table].toRemote(record);
}
