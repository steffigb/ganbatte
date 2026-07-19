import type { ItemType } from '@/types/domain';

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const DAILY_REVIEW_LIMIT = 30;

/** Item types included in SRS sessions (v1). */
export const SRS_ITEM_TYPES: readonly ItemType[] = ['word', 'kanji', 'grammar'];

export function isSrsItemType(type: ItemType): boolean {
  return (SRS_ITEM_TYPES as readonly string[]).includes(type);
}
