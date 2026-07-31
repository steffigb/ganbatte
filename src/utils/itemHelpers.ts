import type { ItemType, Skill } from '@/types/domain';

const itemTypeToSkill: Record<ItemType, Skill> = {
  expression: 'vocabulary',
  kanji: 'kanji',
  grammar: 'grammar',
  reading: 'reading',
  listening: 'listening',
};

export function skillForItemType(type: ItemType): Skill {
  return itemTypeToSkill[type];
}

export function defaultItemTypeForSkill(skill: Skill): ItemType {
  if (skill === 'vocabulary') return 'expression';
  return skill;
}
