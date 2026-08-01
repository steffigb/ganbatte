import type { Theme } from '@/types/domain';
import type { Timestamps, UserOwned } from '@/types/common';

export interface AppSettings extends Timestamps, UserOwned {
  id: string;
  examDate: string;
  dailyGoalMinutes: number;
  n5RecapRatio: number;
  /** Max number of brand-new items introduced via Lessons per day. */
  newItemsPerDay: number;
  locale: string;
  theme: Theme;
}
