import type { ItemType, JlptLevel } from '@/types/domain';

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
};

export const DEFAULT_ITEM_FORM_TYPE_LEVEL: Pick<ItemFormValues, 'type' | 'level'> = {
  type: 'word',
  level: 'N4',
};

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
  };
}
