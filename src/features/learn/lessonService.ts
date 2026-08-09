import { extractKanjiCharacters } from '@/utils/japaneseText';
import { createInitialProgressFields } from '@/lib/srs';
import { getUserProgressByItem, upsertUserProgress } from '@/lib/db';
import { loadStudyContext, type StudyContext } from '@/lib/study';
import type { LearningItem } from '@/types/learningItem';
import type { UserProgress } from '@/types/userProgress';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export type LessonGroup = 'kanji-vocab' | 'grammar' | 'reading' | 'listening';

/** How many new items a single Lessons session presents at once, independent of
 * (and bounded by) the daily `newItemsPerDay` allowance — keeps one sitting short;
 * starting another session the same day picks up where the daily allowance left off. */
export const LESSON_SESSION_SIZE = 5;

export const lessonGroups: readonly LessonGroup[] = [
  'kanji-vocab',
  'grammar',
  'reading',
  'listening',
];

export type LessonQueueEntry = {
  item: LearningItem;
};

function isLearned(context: StudyContext, itemId: string): boolean {
  return context.progressByItemId.has(itemId);
}

function sortStable(items: LearningItem[]): LearningItem[] {
  return [...items].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.japanese.localeCompare(b.japanese, 'ja'),
  );
}

function byLevelThenStable(items: LearningItem[]): LearningItem[] {
  const n5 = sortStable(items.filter((item) => item.level === 'N5'));
  const n4 = sortStable(items.filter((item) => item.level !== 'N5'));
  return [...n5, ...n4];
}

/**
 * Kanji and vocabulary share one ordered lesson queue so that learning a
 * kanji naturally surfaces the words that use it next:
 *   N5 kanji -> N5 vocab unlocked by known kanji -> N4 kanji ->
 *   N4 vocab unlocked by known kanji -> kana-only vocab -> still-blocked vocab.
 * Recomputed on every call since "known kanji" grows as lessons complete.
 */
export function buildKanjiVocabLessonQueue(context: StudyContext): LessonQueueEntry[] {
  const learnedKanjiChars = new Set(
    context.items
      .filter((item) => item.type === 'kanji' && isLearned(context, item.id))
      .map((item) => item.japanese),
  );

  const newItems = context.items.filter(
    (item) => (item.type === 'kanji' || item.type === 'expression') && !isLearned(context, item.id),
  );

  const n5Kanji: LearningItem[] = [];
  const n4Kanji: LearningItem[] = [];
  const n5VocabReady: LearningItem[] = [];
  const n4VocabReady: LearningItem[] = [];
  const kanaOnly: LearningItem[] = [];
  const blocked: LearningItem[] = [];

  for (const item of newItems) {
    if (item.type === 'kanji') {
      (item.level === 'N5' ? n5Kanji : n4Kanji).push(item);
      continue;
    }

    const kanjiChars = extractKanjiCharacters(item.japanese);
    if (kanjiChars.length === 0) {
      kanaOnly.push(item);
      continue;
    }

    const allKnown = kanjiChars.every((char) => learnedKanjiChars.has(char));
    if (allKnown) {
      (item.level === 'N5' ? n5VocabReady : n4VocabReady).push(item);
    } else {
      blocked.push(item);
    }
  }

  const ordered = [
    ...sortStable(n5Kanji),
    ...sortStable(n5VocabReady),
    ...sortStable(n4Kanji),
    ...sortStable(n4VocabReady),
    ...byLevelThenStable(kanaOnly),
    ...byLevelThenStable(blocked),
  ];

  return ordered.map((item) => ({ item }));
}

const LESSON_GROUP_TO_ITEM_TYPE: Record<Exclude<LessonGroup, 'kanji-vocab'>, LearningItem['type']> = {
  grammar: 'grammar',
  reading: 'reading',
  listening: 'listening',
};

export function buildSimpleLessonQueue(
  context: StudyContext,
  group: Exclude<LessonGroup, 'kanji-vocab'>,
): LessonQueueEntry[] {
  const itemType = LESSON_GROUP_TO_ITEM_TYPE[group];
  const newItems = context.items.filter(
    (item) => item.type === itemType && !isLearned(context, item.id),
  );

  return byLevelThenStable(newItems).map((item) => ({ item }));
}

export function buildLessonQueueForGroup(
  context: StudyContext,
  group: LessonGroup,
): LessonQueueEntry[] {
  if (group === 'kanji-vocab') {
    return buildKanjiVocabLessonQueue(context);
  }

  return buildSimpleLessonQueue(context, group);
}

function todayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Lesson completions create the initial user_progress row for each item,
 * counted toward the daily new-item cap. Items become review-eligible
 * immediately (nextReviewAt = now), matching prior "new item" behavior. */
export function countLessonsCompletedToday(context: StudyContext): number {
  const today = todayKey(nowIso());
  return context.userProgress.filter((progress) => todayKey(progress.createdAt) === today).length;
}

export async function completeLessons(
  userId: string,
  items: LearningItem[],
): Promise<UserProgress[]> {
  const timestamp = nowIso();
  const created: UserProgress[] = [];

  for (const item of items) {
    const existing = await getUserProgressByItem(userId, item.id);
    if (existing) {
      continue;
    }

    const progress: UserProgress = {
      id: createId(),
      userId,
      itemId: item.id,
      ...createInitialProgressFields(),
      nextReviewAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await upsertUserProgress(progress);
    created.push(progress);
  }

  return created;
}

export async function buildLessonBatch(
  userId: string,
  group: LessonGroup,
): Promise<{ entries: LessonQueueEntry[]; remainingToday: number }> {
  const context = await loadStudyContext(userId);
  const queue = buildLessonQueueForGroup(context, group);
  const completedToday = countLessonsCompletedToday(context);
  const remainingToday = Math.max(0, context.settings.newItemsPerDay - completedToday);
  const sessionSize = Math.min(LESSON_SESSION_SIZE, remainingToday);

  return { entries: queue.slice(0, sessionSize), remainingToday };
}
