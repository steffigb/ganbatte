import { db } from '@/lib/db/database';
import { DB_SCHEMA_VERSION, SYNC_META_ID } from '@/lib/db/constants';
import type { SyncMeta } from '@/types/sync';

const DEVICE_ID_KEY = 'ganbatte:deviceId';

function readStoredDeviceId(): string | undefined {
  try {
    return localStorage.getItem(DEVICE_ID_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function persistDeviceId(deviceId: string): void {
  try {
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch {
    // IndexedDB remains the source of truth if storage is unavailable.
  }
}

export function createDeviceId(): string {
  return crypto.randomUUID();
}

export async function getDeviceId(): Promise<string> {
  const meta = await db.syncMeta.get(SYNC_META_ID);
  if (meta?.deviceId) {
    persistDeviceId(meta.deviceId);
    return meta.deviceId;
  }

  const stored = readStoredDeviceId();
  if (stored) {
    return stored;
  }

  const deviceId = createDeviceId();
  persistDeviceId(deviceId);
  return deviceId;
}

export async function ensureSyncMeta(): Promise<SyncMeta> {
  const existing = await db.syncMeta.get(SYNC_META_ID);
  if (existing) {
    return existing;
  }

  const deviceId = await getDeviceId();
  const pendingChangeCount = await db.pendingChanges.count();

  const meta: SyncMeta = {
    id: SYNC_META_ID,
    deviceId,
    lastSyncStatus: 'offline',
    pendingChangeCount,
    schemaVersion: DB_SCHEMA_VERSION,
  };

  await db.syncMeta.put(meta);
  return meta;
}
