import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { StudySession } from '@/types/studySession';

export async function getStudySessionById(
  id: string,
): Promise<StudySession | undefined> {
  return db.studySessions.get(id);
}

export async function listStudySessionsByUser(
  userId: string,
): Promise<StudySession[]> {
  return db.studySessions
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('startedAt');
}

export async function upsertStudySession(
  session: StudySession,
): Promise<string> {
  const existing = await db.studySessions.get(session.id);
  const record = withTimestamps(session, existing);

  await db.studySessions.put(record);
  await enqueuePendingChange(
    'studySessions',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteStudySession(id: string): Promise<void> {
  const existing = await db.studySessions.get(id);
  if (!existing) {
    return;
  }

  await db.studySessions.delete(id);
  await enqueuePendingChange('studySessions', id, 'delete');
}
