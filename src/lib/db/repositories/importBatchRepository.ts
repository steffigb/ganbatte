import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { ImportBatch } from '@/types/importBatch';

export async function getImportBatchById(
  id: string,
): Promise<ImportBatch | undefined> {
  return db.importBatches.get(id);
}

export async function listImportBatchesByUser(
  userId: string,
): Promise<ImportBatch[]> {
  return db.importBatches
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('importedAt');
}

export async function upsertImportBatch(batch: ImportBatch): Promise<string> {
  const existing = await db.importBatches.get(batch.id);
  const record = withTimestamps(batch, existing);

  await db.importBatches.put(record);
  await enqueuePendingChange(
    'importBatches',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteImportBatch(id: string): Promise<void> {
  const existing = await db.importBatches.get(id);
  if (!existing) {
    return;
  }

  await db.importBatches.delete(id);
  await enqueuePendingChange('importBatches', id, 'delete');
}
