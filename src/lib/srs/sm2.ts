import {
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
} from '@/lib/srs/constants';
import type { MasteryLevel } from '@/types/domain';
import type { ReviewGrade } from '@/types/review';
import type { UserProgress } from '@/types/userProgress';

export type Sm2Input = Pick<
  UserProgress,
  'intervalDays' | 'easeFactor' | 'repetitions'
>;

export type Sm2Result = Sm2Input & {
  masteryLevel: MasteryLevel;
};

function clampEaseFactor(easeFactor: number): number {
  return Math.max(MIN_EASE_FACTOR, easeFactor);
}

/** SuperMemo-2 ease factor update for quality q (0–5). */
export function nextEaseFactor(current: number, grade: ReviewGrade): number {
  const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  return clampEaseFactor(current + delta);
}

export function computeMasteryLevel(
  intervalDays: number,
  repetitions: number,
  accuracyRecent?: number,
): MasteryLevel {
  if (repetitions === 0 && intervalDays === 0) {
    return 'new';
  }

  if (
    accuracyRecent !== undefined &&
    accuracyRecent >= 90 &&
    intervalDays >= 14
  ) {
    return 'mastered';
  }

  if (intervalDays >= 7) {
    return 'familiar';
  }

  return 'learning';
}

/** Map review grades (0–5) to a 0–100 accuracy score. */
export function gradeToAccuracy(grades: ReviewGrade[]): number | undefined {
  if (grades.length === 0) {
    return undefined;
  }

  const total = grades.reduce<number>((sum, grade) => sum + (grade / 5) * 100, 0);
  return Math.round(total / grades.length);
}

export function applySm2Grade(
  progress: Sm2Input,
  grade: ReviewGrade,
  accuracyRecent?: number,
): Sm2Result {
  const easeFactor = nextEaseFactor(progress.easeFactor, grade);

  if (grade < 3) {
    const intervalDays = 1;
    return {
      easeFactor,
      intervalDays,
      repetitions: 0,
      masteryLevel: computeMasteryLevel(intervalDays, 0, accuracyRecent),
    };
  }

  let intervalDays: number;
  const repetitions = progress.repetitions + 1;

  if (progress.repetitions === 0) {
    intervalDays = 1;
  } else if (progress.repetitions === 1) {
    intervalDays = 6;
  } else {
    intervalDays = Math.max(1, Math.round(progress.intervalDays * easeFactor));
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    masteryLevel: computeMasteryLevel(intervalDays, repetitions, accuracyRecent),
  };
}

export function createInitialProgressFields(): Sm2Input & { masteryLevel: MasteryLevel } {
  return {
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    masteryLevel: 'new',
  };
}

export function addDays(fromIso: string, days: number): string {
  const date = new Date(fromIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
