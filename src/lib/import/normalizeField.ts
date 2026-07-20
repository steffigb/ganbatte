import type { ItemType, JlptLevel, Skill } from '@/types/domain';
import { defaultItemTypeForSkill, skillForItemType } from '@/utils/itemHelpers';
import { joinMeaningParts, splitMeaningParts } from '@/utils/meaningText';

const ITEM_TYPES: ItemType[] = ['word', 'kanji', 'grammar', 'reading', 'listening'];
const LEVELS: JlptLevel[] = ['N5', 'N4'];
const SKILLS: Skill[] = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening'];

export function parseItemType(value: string | undefined): ItemType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'vocab' || normalized === 'vocabulary') {
    return 'word';
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

export function combineNotes(
  notes: string | undefined,
  exampleMeaning: string | undefined,
): string | undefined {
  const trimmedNotes = notes?.trim();
  const trimmedExampleMeaning = exampleMeaning?.trim();

  if (trimmedNotes && trimmedExampleMeaning) {
    return `${trimmedNotes}\nExample meaning: ${trimmedExampleMeaning}`;
  }

  if (trimmedExampleMeaning) {
    return `Example meaning: ${trimmedExampleMeaning}`;
  }

  return trimmedNotes || undefined;
}

export function itemTypeFromSkill(skill: Skill): ItemType {
  return defaultItemTypeForSkill(skill);
}
