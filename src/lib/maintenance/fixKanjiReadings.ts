import { listItemsByUser, upsertItem } from '@/lib/db';
import { resolveReadingStatus } from '@/utils/kanjiReading';
import type { LearningItem } from '@/types/learningItem';

export type MarkUnsetKanjiReadingsResult = {
  itemCount: number;
  fieldCount: number;
};

function isUnset(item: LearningItem, field: 'onyomi' | 'kunyomi'): boolean {
  const status = field === 'onyomi' ? item.onyomiStatus : item.kunyomiStatus;
  const value = field === 'onyomi' ? item.onyomi : item.kunyomi;
  return resolveReadingStatus(status, value) === 'unset';
}

/** Count of individual onyomi/kunyomi fields across the user's kanji that are
 * still `unset` (never confirmed as present or absent) — one kanji with both
 * fields unset counts as 2. */
export async function countUnsetKanjiReadings(userId: string): Promise<number> {
  const kanjiItems = (await listItemsByUser(userId)).filter((item) => item.type === 'kanji');

  return kanjiItems.reduce((count, item) => {
    return count + (isUnset(item, 'onyomi') ? 1 : 0) + (isUnset(item, 'kunyomi') ? 1 : 0);
  }, 0);
}

/** For every kanji with an unconfirmed onyomi/kunyomi, marks that field as
 * confirmed-absent ('none') instead of 'unset', so it displays as an em-dash
 * rather than "not set". Fields already 'set' or 'none' are left untouched. */
export async function markUnsetKanjiReadingsAsNone(
  userId: string,
): Promise<MarkUnsetKanjiReadingsResult> {
  const kanjiItems = (await listItemsByUser(userId)).filter((item) => item.type === 'kanji');

  let itemCount = 0;
  let fieldCount = 0;

  for (const item of kanjiItems) {
    const onyomiUnset = isUnset(item, 'onyomi');
    const kunyomiUnset = isUnset(item, 'kunyomi');

    if (!onyomiUnset && !kunyomiUnset) {
      continue;
    }

    await upsertItem({
      ...item,
      onyomiStatus: onyomiUnset ? 'none' : item.onyomiStatus,
      kunyomiStatus: kunyomiUnset ? 'none' : item.kunyomiStatus,
    });

    itemCount += 1;
    fieldCount += (onyomiUnset ? 1 : 0) + (kunyomiUnset ? 1 : 0);
  }

  return { itemCount, fieldCount };
}
