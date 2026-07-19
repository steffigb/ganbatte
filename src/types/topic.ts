import type { JlptLevel, Skill } from '@/types/domain';
import type { SoftDeletable, Timestamps, UserOwned } from '@/types/common';

export interface Topic extends Timestamps, SoftDeletable, UserOwned {
  id: string;
  level: JlptLevel;
  skill: Skill;
  name: string;
  parentTopicId?: string;
  description?: string;
  sortOrder?: number;
}
