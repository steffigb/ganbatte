import type {
  ItemType,
  JlptLevel,
  PartOfSpeech,
  ReadingStatus,
  Transitivity,
  VerbType,
} from '@/types/domain';
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
  /** Expression-only word-class fields. */
  partOfSpeech?: PartOfSpeech | '';
  verbType?: VerbType | '';
  transitivity?: Transitivity | '';
  /** Japanese text of the paired verb; resolved to `pairedItemId` on save. */
  pairedWithJapanese?: string;
};

export const DEFAULT_ITEM_FORM_TYPE_LEVEL: Pick<ItemFormValues, 'type' | 'level'> = {
  type: 'expression',
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
