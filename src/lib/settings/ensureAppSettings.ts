import { getAppSettingsByUser, upsertAppSettings } from '@/lib/db';
import {
  DEFAULT_DAILY_GOAL_MINUTES,
  DEFAULT_EXAM_DATE,
  DEFAULT_LESSON_SIZE,
  DEFAULT_LOCALE,
  DEFAULT_N5_RECAP_RATIO,
} from '@/lib/settings/constants';
import type { AppSettings } from '@/types/appSettings';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export async function ensureAppSettings(userId: string): Promise<AppSettings> {
  const existing = await getAppSettingsByUser(userId);
  if (existing) {
    if (existing.defaultLessonSize === undefined) {
      // Rows cached before the rename hold the value under `newItemsPerDay`
      // (back when it was a daily cap) — carry the user's number over.
      const { newItemsPerDay, ...rest } = existing as AppSettings & { newItemsPerDay?: number };
      const backfilled: AppSettings = {
        ...rest,
        defaultLessonSize: newItemsPerDay ?? DEFAULT_LESSON_SIZE,
      };
      await upsertAppSettings(backfilled);
      return backfilled;
    }

    return existing;
  }

  const timestamp = nowIso();
  const settings: AppSettings = {
    id: createId(),
    userId,
    examDate: DEFAULT_EXAM_DATE,
    dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
    n5RecapRatio: DEFAULT_N5_RECAP_RATIO,
    defaultLessonSize: DEFAULT_LESSON_SIZE,
    locale: DEFAULT_LOCALE,
    theme: 'system',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await upsertAppSettings(settings);
  return settings;
}
