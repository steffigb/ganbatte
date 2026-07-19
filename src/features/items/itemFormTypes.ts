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
