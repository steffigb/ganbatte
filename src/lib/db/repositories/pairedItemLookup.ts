import { db } from '@/lib/db/database';
import { getItemById } from '@/lib/db/repositories/itemRepository';
import { isNotDeleted } from '@/lib/db/repositories/helpers';
import type { LearningItem } from '@/types/learningItem';

/**
 * Only one side of a transitive/intransitive verb pair needs to store
 * `pairedItemId` — the reverse direction is resolved live here, so editing
 * either verb never requires updating the other one to keep a back-link in sync.
 */
export async function findPairedItem(
  userId: string,
  item: LearningItem,
): Promise<LearningItem | undefined> {
  if (item.pairedItemId) {
    const paired = await getItemById(item.pairedItemId);
    if (paired && isNotDeleted(paired)) {
      return paired;
    }
  }

  const reverseMatch = await db.learningItems
    .where('userId')
    .equals(userId)
    .filter((other) => other.pairedItemId === item.id && isNotDeleted(other))
    .first();

  return reverseMatch;
}
