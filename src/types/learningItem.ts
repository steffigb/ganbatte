import type { ItemType, JlptLevel, ReadingStatus, Skill } from '@/types/domain';
import type { SoftDeletable, Timestamps, UserOwned } from '@/types/common';

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface LearningItem extends Timestamps, SoftDeletable, UserOwned {
  id: string;
  type: ItemType;
  level: JlptLevel;
  skill: Skill;
  japanese: string;
  reading?: string;
  readingStatus?: ReadingStatus;
  meaning: string;
  meaningAlt?: string;
  example?: string;
  exampleReading?: string;
  notes?: string;
  onyomi?: string;
  onyomiStatus?: ReadingStatus;
  kunyomi?: string;
  kunyomiStatus?: ReadingStatus;
  passageText?: string;
  audioStoragePath?: string;
  audioUrl?: string;
  audioMimeType?: string;
  questions?: Question[];
  tags: string[];
  isCustom: boolean;
  importBatchId?: string;
}
