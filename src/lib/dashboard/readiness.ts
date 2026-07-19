import { isItemMastered } from '@/lib/topicProgress';
import type { StudyContext } from '@/lib/study/loadStudyContext';
import type { Skill } from '@/types/domain';

const SKILL_WEIGHTS: Record<Skill, number> = {
  vocabulary: 0.25,
  kanji: 0.2,
  grammar: 0.25,
  reading: 0.15,
  listening: 0.15,
};

const SKILLS: Skill[] = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening'];
const LOW_SKILL_THRESHOLD = 60;
const LOW_SKILL_PENALTY = 0.85;

export type SkillReadiness = Record<Skill, number>;

export function computeSkillReadiness(context: StudyContext): SkillReadiness {
  const readiness = {} as SkillReadiness;

  for (const skill of SKILLS) {
    const skillItems = context.items.filter((item) => item.skill === skill);

    if (skillItems.length === 0) {
      readiness[skill] = 0;
      continue;
    }

    let masteredCount = 0;
    for (const item of skillItems) {
      const progress = context.progressByItemId.get(item.id);
      const grades = context.gradesByItemId.get(item.id) ?? [];
      if (isItemMastered(progress, grades)) {
        masteredCount += 1;
      }
    }

    readiness[skill] = Math.round((masteredCount / skillItems.length) * 100);
  }

  return readiness;
}

export function computeOverallReadiness(skillReadiness: SkillReadiness): number {
  let weighted = 0;

  for (const skill of SKILLS) {
    weighted += skillReadiness[skill] * SKILL_WEIGHTS[skill];
  }

  const hasLowSkill = SKILLS.some((skill) => skillReadiness[skill] < LOW_SKILL_THRESHOLD);
  const overall = hasLowSkill ? weighted * LOW_SKILL_PENALTY : weighted;

  return Math.round(overall);
}

export function daysUntilExam(examDate: string, fromDate = new Date()): number {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);

  const diffMs = exam.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}
