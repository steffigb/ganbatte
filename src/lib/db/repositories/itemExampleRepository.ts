import { db } from '@/lib/db/database';
import {
  isNotDeleted,
  withSoftDelete,
  withTimestamps,
} from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { ItemExample } from '@/types/itemExample';
import { exampleReadingKey } from '@/utils/exampleReading';
import { normalizeMeaningText } from '@/utils/meaningText';

function normalizeItemExample(example: ItemExample): ItemExample {
  return {
    ...example,
    example: example.example.trim(),
    exampleReading: exampleReadingKey(example.exampleReading),
    exampleMeaning: example.exampleMeaning
      ? normalizeMeaningText(example.exampleMeaning)
      : undefined,
  };
}

export async function getItemExampleById(
  id: string,
): Promise<ItemExample | undefined> {
  const example = await db.itemExamples.get(id);
  return example && isNotDeleted(example) ? example : undefined;
}

export async function listItemExamplesByItem(itemId: string): Promise<ItemExample[]> {
  const examples = await db.itemExamples.where('itemId').equals(itemId).filter(isNotDeleted).toArray();

  return examples.sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.createdAt.localeCompare(right.createdAt),
  );
}

export async function findItemExampleByContent(
  itemId: string,
  example: string,
  exampleReading?: string,
): Promise<ItemExample | undefined> {
  const match = await db.itemExamples
    .where('[itemId+example+exampleReading]')
    .equals([itemId, example.trim(), exampleReadingKey(exampleReading)])
    .first();

  return match && isNotDeleted(match) ? match : undefined;
}

export async function upsertItemExample(example: ItemExample): Promise<string> {
  const existing = await db.itemExamples.get(example.id);
  const record = normalizeItemExample(withTimestamps(example, existing));

  await db.itemExamples.put(record);
  await enqueuePendingChange(
    'itemExamples',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function softDeleteItemExample(id: string): Promise<void> {
  const existing = await db.itemExamples.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const record = withSoftDelete(existing);
  await db.itemExamples.put(record);
  await enqueuePendingChange('itemExamples', id, 'delete', record);
}

export async function deleteItemExample(id: string): Promise<void> {
  const existing = await db.itemExamples.get(id);
  if (!existing) {
    return;
  }

  await db.itemExamples.delete(id);
  await enqueuePendingChange('itemExamples', id, 'delete');
}
