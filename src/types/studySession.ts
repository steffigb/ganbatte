import type { Skill } from '@/types/domain';
import type { Timestamps, UserOwned } from '@/types/common';

export interface StudySession extends Timestamps, UserOwned {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  skills: Skill[];
  topicIds: string[];
  itemsReviewed: number;
  accuracy?: number;
  notes?: string;
}
