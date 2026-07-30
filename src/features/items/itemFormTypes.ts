import type { ItemType, JlptLevel, ReadingStatus } from '@/types/domain';
import type { KanjiReadingFieldInput } from '@/utils/kanjiReading';
import { kanjiReadingFieldFromItem } from '@/utils/kanjiReading';

export type ItemFormValues = {
  id?: string;
  type: ItemType;
  level: JlptLevel;
  japanese: string;
  reading?: string;
  meaning: string;
  notes?: string;
  topicIds: string[];
  sourceIds: string[];
  sourceReferences: Record<string, string>;
  /** Kanji-only reading fields (tri-state). */
  onyomi?: KanjiReadingFieldInput;
  kunyomi?: KanjiReadingFieldInput;
};

export const DEFAULT_ITEM_FORM_TYPE_LEVEL: Pick<ItemFormValues, 'type' | 'level'> = {
  type: 'word',
  level: 'N4',
};

function defaultKanjiReadingField(): KanjiReadingFieldInput {
  return { value: '', status: 'unset', noneChecked: false };
}

export function createBlankKanjiReadingFields(): Pick<
  ItemFormValues,
  'onyomi' | 'kunyomi'
> {
  return {
    onyomi: defaultKanjiReadingField(),
    kunyomi: defaultKanjiReadingField(),
  };
}

export function kanjiReadingFieldsFromItem(item: {
  onyomi?: string;
  onyomiStatus?: ReadingStatus;
  kunyomi?: string;
  kunyomiStatus?: ReadingStatus;
}): Pick<ItemFormValues, 'onyomi' | 'kunyomi'> {
  return {
    onyomi: kanjiReadingFieldFromItem(item.onyomi, item.onyomiStatus),
    kunyomi: kanjiReadingFieldFromItem(item.kunyomi, item.kunyomiStatus),
  };
}

export function createBlankItemFormValues(
  defaults: Pick<ItemFormValues, 'type' | 'level'> = DEFAULT_ITEM_FORM_TYPE_LEVEL,
): ItemFormValues {
  return {
    type: defaults.type,
    level: defaults.level,
    japanese: '',
    reading: '',
    meaning: '',
    notes: '',
    topicIds: [],
    sourceIds: [],
    sourceReferences: {},
    ...(defaults.type === 'kanji' ? createBlankKanjiReadingFields() : {}),
  };
}
