import { doesItemNeedAttention } from '@/lib/topicProgress/itemProgress';
import type { ItemType, MasteryLevel } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';
import type { ReviewGrade } from '@/types/review';
import type { Topic } from '@/types/topic';
import type { TopicProgress } from '@/types/topicProgress';
import type { UserProgress } from '@/types/userProgress';
import { textIncludesQuery, textStartsWithQuery } from '@/utils/japaneseText';

import {
  emptySearchResults,
  type ItemSearchResult,
  type ItemSearchSource,
  type SearchFilters,
  type SearchItemGroupKey,
  type SearchResults,
  type TopicSearchResult,
} from '@/lib/search/types';

export type SearchLocalInput = {
  query: string;
  filters: SearchFilters;
  items: LearningItem[];
  topics: Topic[];
  progressByItemId: Map<string, UserProgress>;
  gradesByItemId: Map<string, ReviewGrade[]>;
  topicProgressById: Map<string, TopicProgress>;
  sourceMetaByItemId: Map<string, string[]>;
  sourceEntriesByItemId: Map<string, ItemSearchSource[]>;
  now: string;
};

function groupKeyForItemType(type: ItemType): SearchItemGroupKey {
  switch (type) {
    case 'expression':
      return 'vocabulary';
    case 'kanji':
      return 'kanji';
    case 'grammar':
      return 'grammar';
    case 'reading':
      return 'reading';
    case 'listening':
      return 'listening';
  }
}

function itemTypeLabel(type: ItemType): string {
  switch (type) {
    case 'expression':
      return 'expression';
    case 'kanji':
      return 'kanji';
    case 'grammar':
      return 'grammar';
    case 'reading':
      return 'reading';
    case 'listening':
      return 'listening';
  }
}

function matchesTypeFilter(filters: SearchFilters, type: ItemType): boolean {
  return filters.type === 'all' || filters.type === type;
}

function matchesPartOfSpeechFilter(filters: SearchFilters, item: LearningItem): boolean {
  return filters.partOfSpeech === 'all' || filters.partOfSpeech === item.partOfSpeech;
}

function matchesVerbTypeFilter(filters: SearchFilters, item: LearningItem): boolean {
  return filters.verbType === 'all' || filters.verbType === item.verbType;
}

function matchesTransitivityFilter(filters: SearchFilters, item: LearningItem): boolean {
  return filters.transitivity === 'all' || filters.transitivity === item.transitivity;
}

function matchesTopicTypeFilter(filters: SearchFilters): boolean {
  return (
    filters.type === 'all' &&
    filters.partOfSpeech === 'all' &&
    filters.verbType === 'all' &&
    filters.transitivity === 'all'
  );
}

function matchesLevelFilter<T extends { level: string }>(
  filters: SearchFilters,
  entity: T,
): boolean {
  return filters.level === 'all' || filters.level === entity.level;
}

function matchesSkillFilter<T extends { skill: string }>(
  filters: SearchFilters,
  entity: T,
): boolean {
  return filters.skill === 'all' || filters.skill === entity.skill;
}

function resolveItemMasteryLevel(
  progress: UserProgress | undefined,
): MasteryLevel | 'new' {
  return progress?.masteryLevel ?? 'new';
}

function matchesMasteryFilter(
  filters: SearchFilters,
  masteryLevel: MasteryLevel | 'new',
): boolean {
  return filters.mastery === 'all' || filters.mastery === masteryLevel;
}

function getItemSearchFields(
  item: LearningItem,
  sourceMeta: string[] | undefined,
): Array<string | undefined> {
  return [
    item.japanese,
    item.reading,
    item.meaning,
    item.meaningAlt,
    item.notes,
    item.example,
    item.exampleReading,
    item.exampleMeaning,
    item.onyomi,
    item.kunyomi,
    item.passageText,
    ...item.tags,
    ...(sourceMeta ?? []),
  ];
}

function compareItemResults(left: ItemSearchResult, right: ItemSearchResult): number {
  if (left.startsWithQuery !== right.startsWithQuery) {
    return left.startsWithQuery ? -1 : 1;
  }

  return left.item.japanese.localeCompare(right.item.japanese, 'ja');
}

function compareTopicResults(
  left: TopicSearchResult,
  right: TopicSearchResult,
): number {
  if (left.startsWithQuery !== right.startsWithQuery) {
    return left.startsWithQuery ? -1 : 1;
  }

  return left.topic.name.localeCompare(right.topic.name, 'ja');
}

function pushItemResult(
  results: SearchResults,
  groupKey: SearchItemGroupKey,
  result: ItemSearchResult,
): void {
  results[groupKey].push(result);
}

export function searchLocal(input: SearchLocalInput): SearchResults {
  const query = input.query.trim();
  const hasQuery = query.length > 0;

  const results = emptySearchResults();

  if (matchesTopicTypeFilter(input.filters)) {
    for (const topic of input.topics) {
      if (!matchesLevelFilter(input.filters, topic)) {
        continue;
      }

      if (!matchesSkillFilter(input.filters, topic)) {
        continue;
      }

      const progress = input.topicProgressById.get(topic.id);
      if (input.filters.weakOnly && !progress?.needsAttention) {
        continue;
      }

      const fields = [topic.name, topic.description];
      if (hasQuery && !textIncludesQuery(query, ...fields)) {
        continue;
      }

      const topicResult: TopicSearchResult = {
        kind: 'topic',
        topic,
        masteryPercent: progress?.masteryPercent ?? 0,
        needsAttention: progress?.needsAttention ?? false,
        startsWithQuery: textStartsWithQuery(query, topic.name),
      };

      results.topics.push(topicResult);
    }
  }

  for (const item of input.items) {
    if (!matchesTypeFilter(input.filters, item.type)) {
      continue;
    }

    if (!matchesLevelFilter(input.filters, item)) {
      continue;
    }

    if (!matchesSkillFilter(input.filters, item)) {
      continue;
    }

    if (!matchesPartOfSpeechFilter(input.filters, item)) {
      continue;
    }

    if (!matchesVerbTypeFilter(input.filters, item)) {
      continue;
    }

    if (!matchesTransitivityFilter(input.filters, item)) {
      continue;
    }

    const progress = input.progressByItemId.get(item.id);
    const grades = input.gradesByItemId.get(item.id) ?? [];
    const masteryLevel = resolveItemMasteryLevel(progress);

    if (!matchesMasteryFilter(input.filters, masteryLevel)) {
      continue;
    }

    const needsAttention = doesItemNeedAttention(progress, grades, input.now);
    if (input.filters.weakOnly && !needsAttention) {
      continue;
    }

    const sourceMeta = input.sourceMetaByItemId.get(item.id);
    const fields = getItemSearchFields(item, sourceMeta);
    if (hasQuery && !textIncludesQuery(query, ...fields)) {
      continue;
    }

    const itemResult: ItemSearchResult = {
      kind: 'item',
      item,
      masteryLevel,
      needsAttention,
      startsWithQuery: textStartsWithQuery(query, item.japanese, item.reading),
      sources: input.sourceEntriesByItemId.get(item.id) ?? [],
    };

    pushItemResult(results, groupKeyForItemType(item.type), itemResult);
  }

  results.topics.sort(compareTopicResults);
  results.grammar.sort(compareItemResults);
  results.vocabulary.sort(compareItemResults);
  results.kanji.sort(compareItemResults);
  results.reading.sort(compareItemResults);
  results.listening.sort(compareItemResults);

  return results;
}

export function findSimilarItemsLocal(
  input: Omit<SearchLocalInput, 'filters' | 'topics' | 'topicProgressById'>,
  options?: { type?: ItemType; excludeItemId?: string; limit?: number },
): ItemSearchResult[] {
  const query = input.query.trim();
  if (!query) {
    return [];
  }

  const limit = options?.limit ?? 5;
  const matches: ItemSearchResult[] = [];

  for (const item of input.items) {
    if (options?.excludeItemId && item.id === options.excludeItemId) {
      continue;
    }

    if (options?.type && item.type !== options.type) {
      continue;
    }

    const sourceMeta = input.sourceMetaByItemId.get(item.id);
    const fields = getItemSearchFields(item, sourceMeta);
    if (!textIncludesQuery(query, ...fields)) {
      continue;
    }

    const progress = input.progressByItemId.get(item.id);
    const grades = input.gradesByItemId.get(item.id) ?? [];

    matches.push({
      kind: 'item',
      item,
      masteryLevel: resolveItemMasteryLevel(progress),
      needsAttention: doesItemNeedAttention(progress, grades, input.now),
      startsWithQuery: textStartsWithQuery(query, item.japanese, item.reading),
      sources: input.sourceEntriesByItemId.get(item.id) ?? [],
    });
  }

  return matches.sort(compareItemResults).slice(0, limit);
}

export { itemTypeLabel };
