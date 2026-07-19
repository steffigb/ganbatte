import { db } from '@/lib/db/database';
import { withTimestamps } from '@/lib/db/repositories/helpers';
import { enqueuePendingChange } from '@/lib/db/repositories/pendingChangesRepository';
import type { Review } from '@/types/review';

export async function getReviewById(id: string): Promise<Review | undefined> {
  return db.reviews.get(id);
}

export async function listReviewsByItem(itemId: string): Promise<Review[]> {
  return db.reviews
    .where('itemId')
    .equals(itemId)
    .sortBy('reviewedAt');
}

export async function upsertReview(review: Review): Promise<string> {
  const existing = await db.reviews.get(review.id);
  const record = withTimestamps(review, existing);

  await db.reviews.put(record);
  await enqueuePendingChange(
    'reviews',
    record.id,
    existing ? 'update' : 'insert',
    record,
  );

  return record.id;
}

export async function deleteReview(id: string): Promise<void> {
  const existing = await db.reviews.get(id);
  if (!existing) {
    return;
  }

  await db.reviews.delete(id);
  await enqueuePendingChange('reviews', id, 'delete');
}
