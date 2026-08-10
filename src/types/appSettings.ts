import type { Theme } from '@/types/domain';
import type { Timestamps, UserOwned } from '@/types/common';

export interface AppSettings extends Timestamps, UserOwned {
  id: string;
  examDate: string;
  dailyGoalMinutes: number;
  n5RecapRatio: number;
  /** Pre-filled batch size on the lesson setup screen; changeable per session. */
  defaultLessonSize: number;
  locale: string;
  theme: Theme;
}
