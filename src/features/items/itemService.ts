import {
  deleteItemSource,
  deleteItemTopic,
  findItemByJapanese,
  findItemTopicLink,
  getItemById,
  getSourceById,
  listItemSourcesByItem,
  listItemTopicsByItem,
  upsertItem,
  upsertItemSource,
  upsertItemTopic,
} from '@/lib/db';
import type { ItemFormValues } from '@/features/items/itemFormTypes';
import { createBlankKanjiReadingFields, kanjiReadingFieldsFromItem } from '@/features/items/itemFormTypes';
import type { LearningItem } from '@/types/learningItem';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';
import { skillForItemType } from '@/utils/itemHelpers';
import { normalizeMeaningText, formatItemMeaning } from '@/utils/meaningText';
import {
  kanjiReadingFieldToStored,
  validateKanjiReadingFields,
} from '@/utils/kanjiReading';

export async function loadItemFormValues(
  itemId: string,
): Promise<ItemFormValues | undefined> {
  const item = await getItemById(itemId);
  if (!item) {
    return undefined;
  }

  const [topicLinks, sourceLinks] = await Promise.all([
    listItemTopicsByItem(itemId),
    listItemSourcesByItem(itemId),
  ]);

  const sourceReferences: Record<string, string> = {};
  for (const link of sourceLinks) {
    if (link.reference) {
      sourceReferences[link.sourceId] = link.reference;
    }
  }

  return {
    id: item.id,
    type: item.type,
    level: item.level,
    japanese: item.japanese,
    reading: item.reading,
    meaning: formatItemMeaning(item.meaning, item.meaningAlt),
    notes: item.notes,
    topicIds: topicLinks.map((link) => link.topicId),
    sourceIds: sourceLinks.map((link) => link.sourceId),
    sourceReferences,
    ...(item.type === 'kanji' ? kanjiReadingFieldsFromItem(item) : {}),
  };
}

async function syncItemTopics(
  userId: string,
  itemId: string,
  topicIds: string[],
): Promise<void> {
  const existingLinks = await listItemTopicsByItem(itemId);
  const selected = new Set(topicIds);

  for (const link of existingLinks) {
    if (!selected.has(link.topicId)) {
      await deleteItemTopic(link.id);
    }
  }

  for (const topicId of topicIds) {
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

async function syncItemSources(
  userId: string,
  itemId: string,
  sourceIds: string[],
  sourceReferences: Record<string, string>,
): Promise<void> {
  const existingLinks = await listItemSourcesByItem(itemId);
  const selected = new Set(sourceIds);

  for (const link of existingLinks) {
    if (!selected.has(link.sourceId)) {
      await deleteItemSource(link.id);
    }
  }

  for (const sourceId of sourceIds) {
    const source = await getSourceById(sourceId);
    if (!source) {
      throw new Error('Selected source was not found');
    }

    const reference = sourceReferences[sourceId]?.trim() || undefined;
    const existing = existingLinks.find((link) => link.sourceId === sourceId);
    const timestamp = nowIso();

    if (existing) {
      await upsertItemSource({
        ...existing,
        reference,
        updatedAt: timestamp,
      });
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
}

export async function saveItemWithRelations(
  userId: string,
  values: ItemFormValues,
): Promise<string> {
  const japanese = values.japanese.trim();
  const meaning = normalizeMeaningText(values.meaning.trim());

  if (!japanese || !meaning) {
    throw new Error('Japanese and meaning are required');
  }

  const duplicate = await findItemByJapanese(userId, values.type, japanese);
  if (duplicate && duplicate.id !== values.id) {
    throw new Error('An item with this Japanese text and type already exists');
  }

  const timestamp = nowIso();
  const itemId = values.id ?? createId();
  const existing = values.id ? await getItemById(values.id) : undefined;

  const baseItem: LearningItem = {
    id: itemId,
    userId,
    type: values.type,
    level: values.level,
    skill: skillForItemType(values.type),
    japanese,
    meaning,
    meaningAlt: undefined,
    notes: values.notes?.trim() || undefined,
    tags: existing?.tags ?? [],
    isCustom: true,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  let item: LearningItem;

  if (values.type === 'kanji') {
    const onyomiField = values.onyomi ?? createBlankKanjiReadingFields().onyomi!;
    const kunyomiField = values.kunyomi ?? createBlankKanjiReadingFields().kunyomi!;

    const onyomi = kanjiReadingFieldToStored(onyomiField);
    const kunyomi = kanjiReadingFieldToStored(kunyomiField);

    validateKanjiReadingFields({
      onyomi: onyomi.value,
      onyomiStatus: onyomi.status,
      kunyomi: kunyomi.value,
      kunyomiStatus: kunyomi.status,
    });

    item = {
      ...baseItem,
      reading: undefined,
      onyomi: onyomi.value,
      onyomiStatus: onyomi.status,
      kunyomi: kunyomi.value,
      kunyomiStatus: kunyomi.status,
    };
  } else {
    item = {
      ...baseItem,
      reading: values.reading?.trim() || undefined,
    };
  }

  await upsertItem(item);
  await syncItemTopics(userId, itemId, values.topicIds);
  await syncItemSources(userId, itemId, values.sourceIds, values.sourceReferences);

  return itemId;
}
