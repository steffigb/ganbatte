import { getAppSettingsByUser, upsertAppSettings } from '@/lib/db';
import {
  DEFAULT_DAILY_GOAL_MINUTES,
  DEFAULT_EXAM_DATE,
  DEFAULT_LOCALE,
  DEFAULT_N5_RECAP_RATIO,
  DEFAULT_NEW_ITEMS_PER_DAY,
} from '@/lib/settings/constants';
import type { AppSettings } from '@/types/appSettings';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export async function ensureAppSettings(userId: string): Promise<AppSettings> {
  const existing = await getAppSettingsByUser(userId);
  if (existing) {
    if (existing.newItemsPerDay === undefined) {
      const backfilled: AppSettings = {
        ...existing,
        newItemsPerDay: DEFAULT_NEW_ITEMS_PER_DAY,
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
    newItemsPerDay: DEFAULT_NEW_ITEMS_PER_DAY,
    locale: DEFAULT_LOCALE,
    theme: 'system',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await upsertAppSettings(settings);
  return settings;
}
