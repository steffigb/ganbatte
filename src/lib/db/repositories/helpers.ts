export function nowIso(): string {
  return new Date().toISOString();
}

export function isNotDeleted<T extends { deletedAt?: string }>(
  record: T,
): boolean {
  return record.deletedAt === undefined;
}

export function withTimestamps<T extends { createdAt?: string; updatedAt?: string }>(
  record: T,
  existing?: Pick<T, 'createdAt' | 'updatedAt'>,
): T & { createdAt: string; updatedAt: string } {
  const timestamp = nowIso();

  return {
    ...record,
    createdAt: existing?.createdAt ?? record.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export function withSoftDelete<T extends { deletedAt?: string }>(
  record: T,
): T & { deletedAt: string; updatedAt: string } {
  return {
    ...record,
    deletedAt: nowIso(),
    updatedAt: nowIso(),
  };
}
