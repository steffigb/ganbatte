import type { ItemType, Skill } from '@/types/domain';

const itemTypeToSkill: Record<ItemType, Skill> = {
  word: 'vocabulary',
  kanji: 'kanji',
  grammar: 'grammar',
  reading: 'reading',
  listening: 'listening',
};

export function skillForItemType(type: ItemType): Skill {
  return itemTypeToSkill[type];
}

export function defaultItemTypeForSkill(skill: Skill): ItemType {
  if (skill === 'vocabulary') return 'word';
  return skill;
}
