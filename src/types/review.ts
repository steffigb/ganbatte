import type { Timestamps, UserOwned } from '@/types/common';

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface Review extends Timestamps, UserOwned {
  id: string;
  itemId: string;
  grade: ReviewGrade;
  responseTimeMs?: number;
  reviewedAt: string;
  deviceId?: string;
}
