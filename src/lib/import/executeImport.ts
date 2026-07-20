import {
  findItemByJapanese,
  findItemExampleByContent,
  findItemSourceLink,
  findItemTopicLink,
  listTopicsBySkill,
  upsertImportBatch,
  upsertItem,
  upsertItemExample,
  upsertItemSource,
  upsertItemTopic,
  findSourceByLabel,
  upsertSource,
  upsertTopic,
} from '@/lib/db';
import {
  hasImportExample,
  shouldStoreExamplesOnItem,
} from '@/lib/import/exampleHelpers';
import { itemDuplicateKey } from '@/lib/import/parseRow';
import type {
  ImportOptions,
  ImportPreview,
  ImportResult,
  ParsedImportRow,
} from '@/lib/import/types';
import type { ImportError } from '@/types/importBatch';
import type { JlptLevel, Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

function mergeTags(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])];
}

function topicCacheKey(level: JlptLevel, skill: Skill, name: string): string {
  return `${level}:${skill}:${name.trim().toLowerCase()}`;
}

async function resolveTopicId(
  userId: string,
  level: JlptLevel,
  skill: Skill,
  name: string,
  createTopics: boolean,
  topicCache: Map<string, string>,
): Promise<string | undefined> {
  const cacheKey = topicCacheKey(level, skill, name);
  const cached = topicCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const topics = await listTopicsBySkill(userId, level, skill);
  const match = topics.find((topic) => topic.name.toLowerCase() === name.trim().toLowerCase());
  if (match) {
    topicCache.set(cacheKey, match.id);
    return match.id;
  }

  if (!createTopics) {
    return undefined;
  }

  const timestamp = nowIso();
  const topicId = createId();
  await upsertTopic({
    id: topicId,
    userId,
    level,
    skill,
    name: name.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  topicCache.set(cacheKey, topicId);
  return topicId;
}

async function resolveSourceId(
  userId: string,
  label: string,
  createSources: boolean,
  sourceCache: Map<string, string>,
): Promise<string | undefined> {
  const cacheKey = label.trim().toLowerCase();
  const cached = sourceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const existing = await findSourceByLabel(userId, label.trim());
  if (existing) {
    sourceCache.set(cacheKey, existing.id);
    return existing.id;
  }

  if (!createSources) {
    return undefined;
  }

  const timestamp = nowIso();
  const sourceId = createId();
  await upsertSource({
    id: sourceId,
    userId,
    label: label.trim(),
    type: 'list',
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  sourceCache.set(cacheKey, sourceId);
  return sourceId;
}

async function linkTopics(
  userId: string,
  itemId: string,
  row: ParsedImportRow,
  options: ImportOptions,
  topicCache: Map<string, string>,
): Promise<void> {
  for (const topicName of row.topicNames) {
    const topicId = await resolveTopicId(
      userId,
      row.level,
      row.skill,
      topicName,
      options.createTopics,
      topicCache,
    );
    if (!topicId) {
      continue;
    }

    const existing = await findItemTopicLink(itemId, topicId);
    if (existing) {
      continue;
    }

    const timestamp = nowIso();
    await upsertItemTopic({
      id: createId(),
      userId,
      itemId,
      topicId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

async function attachSource(
  userId: string,
  itemId: string,
  row: ParsedImportRow,
  options: ImportOptions,
  sourceCache: Map<string, string>,
): Promise<boolean> {
  if (!row.sourceLabel) {
    return false;
  }

  const sourceId = await resolveSourceId(userId, row.sourceLabel, options.createSources, sourceCache);
  if (!sourceId) {
    return false;
  }

  const existing = await findItemSourceLink(itemId, sourceId);
  const timestamp = nowIso();

  if (existing) {
    if (row.sourceRef) {
      await upsertItemSource({
        ...existing,
        reference: row.sourceRef,
        updatedAt: timestamp,
      });
    }
    return true;
  }

  await upsertItemSource({
    id: createId(),
    userId,
    itemId,
    sourceId,
    reference: row.sourceRef,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return true;
}

function buildLearningItem(
  userId: string,
  row: ParsedImportRow,
  batchId: string,
  existing?: LearningItem,
): LearningItem {
  const timestamp = nowIso();
  const id = existing?.id ?? createId();
  const storeExampleOnItem = shouldStoreExamplesOnItem(row.type);

  const base: LearningItem = {
    id,
    userId,
    type: row.type,
    level: row.level,
    skill: row.skill,
    japanese: row.japanese,
    meaning: row.meaning,
    meaningAlt: row.meaningAlt,
    example: storeExampleOnItem ? row.example : undefined,
    exampleReading: storeExampleOnItem ? row.exampleReading : undefined,
    notes: row.notes,
    tags: existing ? mergeTags(existing.tags, row.tags) : row.tags,
    isCustom: true,
    importBatchId: batchId,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  if (row.type === 'kanji') {
    return {
      ...base,
      reading: row.reading,
      readingStatus: row.readingStatus,
      onyomi: row.onyomi,
      onyomiStatus: row.onyomiStatus,
      kunyomi: row.kunyomi,
      kunyomiStatus: row.kunyomiStatus,
    };
  }

  return {
    ...base,
    reading: row.reading,
  };
}

async function upsertExampleFromRow(
  userId: string,
  itemId: string,
  row: ParsedImportRow,
  sortOrder: number,
): Promise<boolean> {
  const example = row.example?.trim();
  if (!example) {
    return false;
  }

  const existing = await findItemExampleByContent(itemId, example, row.exampleReading);
  if (existing) {
    return false;
  }

  const timestamp = nowIso();
  await upsertItemExample({
    id: createId(),
    userId,
    itemId,
    example,
    exampleReading: row.exampleReading,
    exampleMeaning: row.exampleMeaning,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return true;
}

async function createItemFromRow(
  userId: string,
  row: ParsedImportRow,
  batchId: string,
  options: ImportOptions,
  topicCache: Map<string, string>,
  sourceCache: Map<string, string>,
  itemIdByKey: Map<string, string>,
): Promise<string> {
  const item = buildLearningItem(userId, row, batchId);
  await upsertItem(item);
  itemIdByKey.set(itemDuplicateKey(row.type, row.japanese), item.id);
  await linkTopics(userId, item.id, row, options, topicCache);
  await attachSource(userId, item.id, row, options, sourceCache);
  return item.id;
}

async function updateItemFromRow(
  userId: string,
  row: ParsedImportRow,
  batchId: string,
  existing: LearningItem,
  options: ImportOptions,
  topicCache: Map<string, string>,
  sourceCache: Map<string, string>,
  itemIdByKey: Map<string, string>,
): Promise<string> {
  const item = buildLearningItem(userId, row, batchId, existing);
  await upsertItem(item);
  itemIdByKey.set(itemDuplicateKey(row.type, row.japanese), item.id);
  await linkTopics(userId, item.id, row, options, topicCache);
  await attachSource(userId, item.id, row, options, sourceCache);
  return item.id;
}

async function resolveItemId(
  userId: string,
  row: ParsedImportRow,
  itemIdByKey: Map<string, string>,
): Promise<string | undefined> {
  const key = itemDuplicateKey(row.type, row.japanese);
  const cached = itemIdByKey.get(key);
  if (cached) {
    return cached;
  }

  const existing = await findItemByJapanese(userId, row.type, row.japanese);
  if (existing) {
    itemIdByKey.set(key, existing.id);
    return existing.id;
  }

  return undefined;
}

export async function executeImport(
  userId: string,
  preview: ImportPreview,
  options: ImportOptions,
  filename?: string,
): Promise<ImportResult> {
  const batchId = createId();
  const importedAt = nowIso();
  const errors: ImportError[] = [];
  let importedCount = 0;
  let examplesCount = 0;
  let attachedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const topicCache = new Map<string, string>();
  const sourceCache = new Map<string, string>();
  const itemIdByKey = new Map<string, string>();
  const exampleSortByItem = new Map<string, number>();

  const nextExampleSortOrder = (itemId: string): number => {
    const next = exampleSortByItem.get(itemId) ?? 0;
    exampleSortByItem.set(itemId, next + 1);
    return next;
  };

  for (const previewRow of preview.rows) {
    if (previewRow.status === 'invalid') {
      skippedCount += 1;
      errors.push({
        row: previewRow.rowNumber,
        message: previewRow.errors.join('; '),
      });
      continue;
    }

    if (previewRow.status === 'duplicate') {
      skippedCount += 1;
      continue;
    }

    if (!previewRow.data) {
      skippedCount += 1;
      errors.push({
        row: previewRow.rowNumber,
        message: 'Row could not be parsed',
      });
      continue;
    }

    const row = previewRow.data;

    try {
      if (previewRow.status === 'valid') {
        const existing = await findItemByJapanese(userId, row.type, row.japanese);

        if (existing) {
          if (options.duplicateAction === 'skip') {
            skippedCount += 1;
            continue;
          }

          if (options.duplicateAction === 'update') {
            await updateItemFromRow(
              userId,
              row,
              batchId,
              existing,
              options,
              topicCache,
              sourceCache,
              itemIdByKey,
            );
            updatedCount += 1;
          } else {
            itemIdByKey.set(itemDuplicateKey(row.type, row.japanese), existing.id);
            await linkTopics(userId, existing.id, row, options, topicCache);
            const attached = await attachSource(userId, existing.id, row, options, sourceCache);
            if (attached || row.topicNames.length > 0) {
              attachedCount += 1;
            }
          }
        } else {
          await createItemFromRow(
            userId,
            row,
            batchId,
            options,
            topicCache,
            sourceCache,
            itemIdByKey,
          );
          importedCount += 1;
        }

        const itemId = await resolveItemId(userId, row, itemIdByKey);
        if (itemId && hasImportExample(row)) {
          const created = await upsertExampleFromRow(
            userId,
            itemId,
            row,
            nextExampleSortOrder(itemId),
          );
          if (created) {
            examplesCount += 1;
          }
        }

        continue;
      }

      if (previewRow.status === 'example') {
        const itemId = await resolveItemId(userId, row, itemIdByKey);
        if (!itemId) {
          skippedCount += 1;
          errors.push({
            row: previewRow.rowNumber,
            message: 'Example row has no matching item to attach to',
          });
          continue;
        }

        await linkTopics(userId, itemId, row, options, topicCache);
        await attachSource(userId, itemId, row, options, sourceCache);

        if (hasImportExample(row)) {
          const created = await upsertExampleFromRow(
            userId,
            itemId,
            row,
            nextExampleSortOrder(itemId),
          );
          if (created) {
            examplesCount += 1;
          } else {
            skippedCount += 1;
          }
        } else {
          skippedCount += 1;
        }
      }
    } catch (cause) {
      skippedCount += 1;
      errors.push({
        row: previewRow.rowNumber,
        message: cause instanceof Error ? cause.message : 'Import failed for row',
      });
    }
  }

  const errorCount = errors.length;

  await upsertImportBatch({
    id: batchId,
    userId,
    filename,
    importedAt,
    itemCount: importedCount + updatedCount + examplesCount,
    skippedCount,
    errorCount,
    errors: errorCount > 0 ? errors : undefined,
    createdAt: importedAt,
    updatedAt: importedAt,
  });

  return {
    batchId,
    importedCount,
    examplesCount,
    attachedCount,
    updatedCount,
    skippedCount,
    errorCount,
    errors,
  };
}
