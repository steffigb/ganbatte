import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { Source } from '@/types/source';

export async function getSourceById(id: string): Promise<Source | undefined> {
  return db.sources.get(id);
}

export async function listSourcesByUser(userId: string): Promise<Source[]> {
  const sources = await db.sources.where('userId').equals(userId).toArray();
  return sources.sort((a, b) => a.label.localeCompare(b.label));
}

export async function findSourceByLabel(
  userId: string,
  label: string,
): Promise<Source | undefined> {
  return db.sources
    .where('[userId+label]')
    .equals([userId, label])
    .first();
}

export async function upsertSource(source: Source): Promise<string> {
  const existing = await db.sources.get(source.id);
  const record = withTimestamps(source, existing);

  await db.sources.put(record);
  await enqueuePendingChange(
    'sources',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteSource(id: string): Promise<void> {
  const existing = await db.sources.get(id);
  if (!existing) {
    return;
  }

  await db.sources.delete(id);
  await enqueuePendingChange('sources', id, 'delete');
}
