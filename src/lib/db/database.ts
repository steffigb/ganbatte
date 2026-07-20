import Dexie, { type EntityTable } from 'dexie';

import type { AppSettings } from '@/types/appSettings';
import type { ImportBatch } from '@/types/importBatch';
import type { ItemExample } from '@/types/itemExample';
import type { ItemSource, ItemTopic } from '@/types/itemRelations';
import type { LearningItem } from '@/types/learningItem';
import type { Review } from '@/types/review';
import type { Source } from '@/types/source';
import type { StudySession } from '@/types/studySession';
import type { PendingChange, SyncMeta } from '@/types/sync';
import type { Topic } from '@/types/topic';
import type { UserProgress } from '@/types/userProgress';

import { DB_NAME, DB_SCHEMA_VERSION } from '@/lib/db/constants';

export class GanbatteDB extends Dexie {
  topics!: EntityTable<Topic, 'id'>;
  sources!: EntityTable<Source, 'id'>;
  learningItems!: EntityTable<LearningItem, 'id'>;
  itemSources!: EntityTable<ItemSource, 'id'>;
  itemTopics!: EntityTable<ItemTopic, 'id'>;
  itemExamples!: EntityTable<ItemExample, 'id'>;
  reviews!: EntityTable<Review, 'id'>;
  userProgress!: EntityTable<UserProgress, 'id'>;
  studySessions!: EntityTable<StudySession, 'id'>;
  importBatches!: EntityTable<ImportBatch, 'id'>;
  appSettings!: EntityTable<AppSettings, 'id'>;
  syncMeta!: EntityTable<SyncMeta, 'id'>;
  pendingChanges!: EntityTable<PendingChange, 'id'>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      topics:
        'id, userId, level, skill, name, parentTopicId, updatedAt, deletedAt, [userId+level+skill]',
      sources: 'id, userId, label, updatedAt, [userId+label]',
      learningItems:
        'id, userId, type, level, skill, japanese, reading, updatedAt, deletedAt, importBatchId, [userId+japanese+type], [userId+level+skill], *tags',
      itemSources: 'id, userId, itemId, sourceId, updatedAt, [itemId+sourceId]',
      itemTopics: 'id, userId, itemId, topicId, updatedAt, [itemId+topicId]',
      reviews: 'id, userId, itemId, reviewedAt, updatedAt',
      userProgress:
        'id, userId, itemId, nextReviewAt, masteryLevel, updatedAt, [userId+itemId], [userId+nextReviewAt]',
      studySessions: 'id, userId, startedAt, updatedAt',
      importBatches: 'id, userId, importedAt, updatedAt',
      appSettings: 'id, userId, updatedAt',
      syncMeta: 'id, deviceId',
      pendingChanges: '++id, table, recordId, operation, createdAt',
    });

    this.version(2).stores({
      itemExamples:
        'id, userId, itemId, example, exampleReading, sortOrder, updatedAt, deletedAt, [itemId+example], [userId+itemId]',
    });

    this.version(DB_SCHEMA_VERSION).stores({
      itemExamples:
        'id, userId, itemId, example, exampleReading, sortOrder, updatedAt, deletedAt, [itemId+example+exampleReading], [userId+itemId]',
    });
  }
}

export const db = new GanbatteDB();
