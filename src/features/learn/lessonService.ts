import { extractKanjiCharacters } from '@/utils/japaneseText';
import { createInitialProgressFields } from '@/lib/srs';
import { getUserProgressByItem, upsertUserProgress } from '@/lib/db';
import { loadStudyContext, type StudyContext } from '@/lib/study';
import {
  loadItemRelationsByUser,
  matchesRelationFilter,
  type ItemRelations,
  type LevelFilter,
  type RelationFilter,
} from '@/features/items';
import type { LearningItem } from '@/types/learningItem';
import type { UserProgress } from '@/types/userProgress';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export type LessonGroup = 'kanji-vocab' | 'grammar' | 'reading' | 'listening';

export const lessonGroups: readonly LessonGroup[] = [
  'kanji-vocab',
  'grammar',
  'reading',
  'listening',
];

export type LessonQueueEntry = {
  item: LearningItem;
  /** False only for kanji-vocab entries whose kanji aren't learned yet — shown
   * as a hint on the setup screen; they still sort last, nothing hides them. */
  kanjiReady: boolean;
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

  const ready = (items: LearningItem[]): LessonQueueEntry[] =>
    items.map((item) => ({ item, kanjiReady: true }));
  const notReady = (items: LearningItem[]): LessonQueueEntry[] =>
    items.map((item) => ({ item, kanjiReady: false }));

  return [
    ...ready(sortStable(n5Kanji)),
    ...ready(sortStable(n5VocabReady)),
    ...ready(sortStable(n4Kanji)),
    ...ready(sortStable(n4VocabReady)),
    ...ready(byLevelThenStable(kanaOnly)),
    ...notReady(byLevelThenStable(blocked)),
  ];
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

  return byLevelThenStable(newItems).map((item) => ({ item, kanjiReady: true }));
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

export type LessonCandidates = {
  /** Full ordered queue for the group — the default suggestion, unfiltered. */
  entries: LessonQueueEntry[];
  relations: Map<string, ItemRelations>;
  defaultLessonSize: number;
};

/** Everything the lesson setup screen needs: the ordered candidate queue for
 * `group`, plus topic/source relations for filtering and the pre-filled batch
 * size from settings. The user picks the final subset from this pool. */
export async function loadLessonCandidates(
  userId: string,
  group: LessonGroup,
): Promise<LessonCandidates> {
  const [context, relations] = await Promise.all([
    loadStudyContext(userId),
    loadItemRelationsByUser(userId),
  ]);

  return {
    entries: buildLessonQueueForGroup(context, group),
    relations,
    defaultLessonSize: context.settings.defaultLessonSize,
  };
}

export function filterLessonCandidates(
  entries: LessonQueueEntry[],
  relations: Map<string, ItemRelations> | null,
  filters: { level: LevelFilter } & RelationFilter,
): LessonQueueEntry[] {
  return entries.filter(({ item }) => {
    if (filters.level !== 'all' && item.level !== filters.level) {
      return false;
    }
    return matchesRelationFilter(item.id, relations, filters);
  });
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
