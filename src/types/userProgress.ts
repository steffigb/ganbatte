import type { MasteryLevel } from '@/types/domain';
import type { Timestamps, UserOwned } from '@/types/common';

export interface UserProgress extends Timestamps, UserOwned {
  id: string;
  itemId: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewAt?: string;
  masteryLevel: MasteryLevel;
  accuracyRecent?: number;
}
