import type {
  ItemType,
  JlptLevel,
  PartOfSpeech,
  Skill,
  Transitivity,
  VerbType,
} from '@/types/domain';
import { defaultItemTypeForSkill, skillForItemType } from '@/utils/itemHelpers';
import { joinMeaningParts, splitMeaningParts } from '@/utils/meaningText';

const ITEM_TYPES: ItemType[] = ['expression', 'kanji', 'grammar', 'reading', 'listening'];
const LEVELS: JlptLevel[] = ['N5', 'N4'];
const SKILLS: Skill[] = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening'];
const PARTS_OF_SPEECH: PartOfSpeech[] = [
  'noun',
  'pronoun',
  'verb',
  'i-adjective',
  'na-adjective',
  'adverb',
  'particle',
  'conjunction',
  'interjection',
  'counter',
  'prefix',
  'suffix',
  'determiner',
  'phrase',
  'other',
];
const VERB_TYPES: VerbType[] = ['godan', 'ichidan', 'irregular'];
const TRANSITIVITY_VALUES: Transitivity[] = ['transitive', 'intransitive', 'both'];

export function parseItemType(value: string | undefined): ItemType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'vocab' || normalized === 'vocabulary' || normalized === 'word') {
    return 'expression';
  }

  return ITEM_TYPES.find((type) => type === normalized);
}

export function parseLevel(value: string | undefined): JlptLevel {
  if (!value) {
    return 'N4';
  }

  const normalized = value.trim().toUpperCase();
  return LEVELS.includes(normalized as JlptLevel) ? (normalized as JlptLevel) : 'N4';
}

export function parseSkill(
  value: string | undefined,
  type: ItemType | undefined,
): Skill | undefined {
  if (value) {
    const normalized = value.trim().toLowerCase() as Skill;
    if (SKILLS.includes(normalized)) {
      return normalized;
    }
  }

  if (type) {
    return skillForItemType(type);
  }

  return undefined;
}

export function parsePartOfSpeech(value: string | undefined): PartOfSpeech | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-');
  if (normalized === 'i-adj' || normalized === 'iadjective') {
    return 'i-adjective';
  }
  if (normalized === 'na-adj' || normalized === 'naadjective') {
    return 'na-adjective';
  }
  if (normalized === 'expression' || normalized === 'set-phrase' || normalized === 'idiom') {
    // "expression" clashes with ItemType's `expression` value, so the word-class
    // category for fixed phrases (e.g. ～ございます, 下さい) is named `phrase`.
    return 'phrase';
  }

  return PARTS_OF_SPEECH.find((pos) => pos === normalized);
}

export function parseVerbType(value: string | undefined): VerbType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return VERB_TYPES.find((verbType) => verbType === normalized);
}

export function parseTransitivity(value: string | undefined): Transitivity | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return TRANSITIVITY_VALUES.find((transitivity) => transitivity === normalized);
}

export function parseTopicNames(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

export function parseTags(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(';')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseMeaningFields(
  meaningValue: string | undefined,
  germanValue: string | undefined,
): { meaning?: string; meaningAlt?: string; error?: string } {
  const raw = (meaningValue ?? germanValue)?.trim();
  if (!raw) {
    return { error: 'Meaning is required' };
  }

  const parts = splitMeaningParts(raw);

  if (parts.length === 0) {
    return { error: 'Meaning is required' };
  }

  return {
    meaning: joinMeaningParts(parts),
  };
}

export function itemTypeFromSkill(skill: Skill): ItemType {
  return defaultItemTypeForSkill(skill);
}
