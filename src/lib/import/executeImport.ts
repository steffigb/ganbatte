import {
  deleteItemSource,
  findItemByJapanese,
  findItemSourceLink,
  findItemTopicLink,
  getItemById,
  listItemSourcesByItem,
  listTopicsBySkill,
  upsertImportBatch,
  upsertItem,
  upsertItemSource,
  upsertItemTopic,
  findSourceByLabel,
  upsertSource,
  upsertTopic,
} from '@/lib/db';
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

async function resolvePairedVerbs(
  userId: string,
  preview: ImportPreview,
  itemIdByKey: Map<string, string>,
): Promise<void> {
  for (const previewRow of preview.rows) {
    const row = previewRow.data;
    if (!row || row.type !== 'expression' || !row.pairedWithJapanese) {
      continue;
    }

    const itemId = itemIdByKey.get(itemDuplicateKey(row.type, row.japanese));
    if (!itemId) {
      continue;
    }

    const pairedId =
      itemIdByKey.get(itemDuplicateKey('expression', row.pairedWithJapanese)) ??
      (await findItemByJapanese(userId, 'expression', row.pairedWithJapanese))?.id;

    if (!pairedId || pairedId === itemId) {
      continue;
    }

    const item = await getItemById(itemId);
    if (!item || item.pairedItemId === pairedId) {
      continue;
    }

    await upsertItem({ ...item, pairedItemId: pairedId });
  }
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

async function attachSources(
  userId: string,
  itemId: string,
  row: ParsedImportRow,
  options: ImportOptions,
  sourceCache: Map<string, string>,
  replaceExisting = false,
): Promise<boolean> {
  if (row.sources.length === 0) {
    return false;
  }

  const timestamp = nowIso();
  const resolvedSourceIds = new Set<string>();
  let attachedAny = false;

  for (const { label, reference } of row.sources) {
    const sourceId = await resolveSourceId(userId, label, options.createSources, sourceCache);
    if (!sourceId) {
      continue;
    }

    resolvedSourceIds.add(sourceId);
    attachedAny = true;

    const existing = await findItemSourceLink(itemId, sourceId);
    if (existing) {
      if (reference) {
        await upsertItemSource({ ...existing, reference, updatedAt: timestamp });
      }
      continue;
    }

    await upsertItemSource({
      id: createId(),
      userId,
      itemId,
      sourceId,
      reference,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  if (replaceExisting) {
    const currentLinks = await listItemSourcesByItem(itemId);
    for (const link of currentLinks) {
      if (!resolvedSourceIds.has(link.sourceId)) {
        await deleteItemSource(link.id);
      }
    }
  }

  return attachedAny;
}

function buildLearningItem(
  userId: string,
  row: ParsedImportRow,
  batchId: string,
  existing?: LearningItem,
): LearningItem {
  const timestamp = nowIso();
  const id = existing?.id ?? createId();

  const base: LearningItem = {
    id,
    userId,
    type: row.type,
    level: row.level,
    skill: row.skill,
    japanese: row.japanese,
    meaning: row.meaning,
    meaningAlt: row.meaningAlt,
    example: row.example,
    exampleReading: row.exampleReading,
    exampleMeaning: row.exampleMeaning,
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
      reading: undefined,
      onyomi: row.onyomi,
      onyomiStatus: row.onyomiStatus,
      kunyomi: row.kunyomi,
      kunyomiStatus: row.kunyomiStatus,
    };
  }

  if (row.type === 'expression') {
    return {
      ...base,
      reading: row.reading,
      partOfSpeech: row.partOfSpeech,
      verbType: row.verbType,
      transitivity: row.transitivity,
    };
  }

  if (row.type === 'grammar') {
    return {
      ...base,
      reading: row.reading,
      explanation: row.explanation,
      formation: row.formation,
    };
  }

  return {
    ...base,
    reading: row.reading,
  };
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
  await attachSources(userId, item.id, row, options, sourceCache);
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
  await attachSources(userId, item.id, row, options, sourceCache, options.replaceSource);
  return item.id;
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
  let attachedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const topicCache = new Map<string, string>();
  const sourceCache = new Map<string, string>();
  const itemIdByKey = new Map<string, string>();

  for (const previewRow of preview.rows) {
    if (previewRow.status === 'invalid') {
      skippedCount += 1;
      errors.push({
        row: previewRow.rowNumber,
        message: previewRow.errors.join('; '),
      });
      continue;
    }

    if (previewRow.status === 'duplicate' && options.duplicateAction === 'skip') {
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
      const existing = await findItemByJapanese(userId, row.type, row.japanese, row.reading);

      if (existing) {
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
          const attached = await attachSources(
            userId,
            existing.id,
            row,
            options,
            sourceCache,
            options.replaceSource,
          );
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
    } catch (cause) {
      skippedCount += 1;
      errors.push({
        row: previewRow.rowNumber,
        message: cause instanceof Error ? cause.message : 'Import failed for row',
      });
    }
  }

  await resolvePairedVerbs(userId, preview, itemIdByKey);

  const errorCount = errors.length;

  await upsertImportBatch({
    id: batchId,
    userId,
    filename,
    importedAt,
    itemCount: importedCount + updatedCount,
    skippedCount,
    errorCount,
    errors: errorCount > 0 ? errors : undefined,
    createdAt: importedAt,
    updatedAt: importedAt,
  });

  return {
    batchId,
    importedCount,
    attachedCount,
    updatedCount,
    skippedCount,
    errorCount,
    errors,
  };
}
