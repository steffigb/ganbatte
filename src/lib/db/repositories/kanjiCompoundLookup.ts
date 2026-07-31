import { db } from '@/lib/db/database';
import { isNotDeleted } from '@/lib/db/repositories/helpers';
import type { LearningItem } from '@/types/learningItem';

/**
 * The kanji <-> compound-vocabulary relationship is never stored — it's
 * derived live by matching text, in both directions. This keeps editing a
 * compound exactly as simple as editing any other vocabulary item.
 */

export async function findKanjiItemsByCharacters(
  userId: string,
  characters: string[],
): Promise<LearningItem[]> {
  if (characters.length === 0) {
    return [];
  }

  const matches = await db.learningItems
    .where('[userId+japanese+type]')
    .anyOf(characters.map((char) => [userId, char, 'kanji']))
    .filter(isNotDeleted)
    .toArray();

  return matches;
}

export async function findVocabularyItemsContainingKanji(
  userId: string,
  kanjiChar: string,
): Promise<LearningItem[]> {
  const vocabulary = await db.learningItems
    .where('userId')
    .equals(userId)
    .filter(
      (item) =>
        item.type === 'expression' && isNotDeleted(item) && item.japanese.includes(kanjiChar),
    )
    .toArray();

  return vocabulary.sort((left, right) => left.japanese.localeCompare(right.japanese));
}
