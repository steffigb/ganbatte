import type { ItemType, JlptLevel, MasteryLevel, Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';
import type { Topic } from '@/types/topic';

export type SearchItemGroupKey =
  | 'grammar'
  | 'vocabulary'
  | 'kanji'
  | 'reading'
  | 'listening';

export type SearchTypeFilter = 'all' | ItemType;
export type SearchLevelFilter = 'all' | JlptLevel;
export type SearchSkillFilter = 'all' | Skill;
export type SearchMasteryFilter = 'all' | MasteryLevel | 'new';

export type SearchFilters = {
  type: SearchTypeFilter;
  level: SearchLevelFilter;
  skill: SearchSkillFilter;
  mastery: SearchMasteryFilter;
  weakOnly: boolean;
};

export const defaultSearchFilters: SearchFilters = {
  type: 'all',
  level: 'all',
  skill: 'all',
  mastery: 'all',
  weakOnly: false,
};

export type ItemSearchResult = {
  kind: 'item';
  item: LearningItem;
  masteryLevel: MasteryLevel | 'new';
  needsAttention: boolean;
  startsWithQuery: boolean;
};

export type TopicSearchResult = {
  kind: 'topic';
  topic: Topic;
  masteryPercent: number;
  needsAttention: boolean;
  startsWithQuery: boolean;
};

export type SearchResults = {
  topics: TopicSearchResult[];
  grammar: ItemSearchResult[];
  vocabulary: ItemSearchResult[];
  kanji: ItemSearchResult[];
  reading: ItemSearchResult[];
  listening: ItemSearchResult[];
};

export type SearchResultGroup = {
  key: 'topics' | SearchItemGroupKey;
  label: string;
  results: Array<ItemSearchResult | TopicSearchResult>;
};

export function emptySearchResults(): SearchResults {
  return {
    topics: [],
    grammar: [],
    vocabulary: [],
    kanji: [],
    reading: [],
    listening: [],
  };
}

export function hasSearchResults(results: SearchResults): boolean {
  return (
    results.topics.length > 0 ||
    results.grammar.length > 0 ||
    results.vocabulary.length > 0 ||
    results.kanji.length > 0 ||
    results.reading.length > 0 ||
    results.listening.length > 0
  );
}

export function flattenSearchResults(results: SearchResults): SearchResultGroup[] {
  const groups: SearchResultGroup[] = [
    { key: 'topics', label: 'Topics', results: results.topics },
    { key: 'grammar', label: 'Grammar', results: results.grammar },
    { key: 'vocabulary', label: 'Vocabulary', results: results.vocabulary },
    { key: 'kanji', label: 'Kanji', results: results.kanji },
    { key: 'reading', label: 'Reading', results: results.reading },
    { key: 'listening', label: 'Listening', results: results.listening },
  ];

  return groups.filter((group) => group.results.length > 0);
}
