import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { AppSettings } from '@/types/appSettings';

export async function getAppSettingsByUser(
  userId: string,
): Promise<AppSettings | undefined> {
  return db.appSettings.where('userId').equals(userId).first();
}

export async function upsertAppSettings(
  settings: AppSettings,
): Promise<string> {
  const existing = await db.appSettings.get(settings.id);
  const record = withTimestamps(settings, existing);

  await db.appSettings.put(record);
  await enqueuePendingChange(
    'appSettings',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteAppSettings(id: string): Promise<void> {
  const existing = await db.appSettings.get(id);
  if (!existing) {
    return;
  }

  await db.appSettings.delete(id);
  await enqueuePendingChange('appSettings', id, 'delete');
}
