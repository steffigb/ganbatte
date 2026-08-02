import { db } from '@/lib/db/database';
import { isNotDeleted } from '@/lib/db/repositories/helpers';
import type { LearningItem } from '@/types/learningItem';

/**
 * Vocabulary referenced in a grammar item's example sentence, derived live by
 * substring matching against the user's own vocabulary list — same
 * derive-don't-store approach as the kanji <-> compound relationship
 * (kanjiCompoundLookup.ts), instead of a stored `related_vocabulary` field
 * that would go stale as the vocabulary list changes.
 */
export async function findVocabularyItemsInText(
  userId: string,
  text: string,
): Promise<LearningItem[]> {
  if (!text) {
    return [];
  }

  const vocabulary = await db.learningItems
    .where('userId')
    .equals(userId)
    .filter(
      (item) =>
        item.type === 'expression' &&
        isNotDeleted(item) &&
        item.japanese.length >= 2 &&
        text.includes(item.japanese),
    )
    .toArray();

  return vocabulary.sort((left, right) => right.japanese.length - left.japanese.length);
}
