import { gradeToAccuracy } from '@/lib/srs';
import type { ReviewGrade } from '@/types/review';
import type { UserProgress } from '@/types/userProgress';

const MASTERED_ACCURACY_THRESHOLD = 90;
const MASTERED_INTERVAL_DAYS = 14;
const ATTENTION_ACCURACY_THRESHOLD = 70;

export function recentGrades(reviews: ReviewGrade[]): ReviewGrade[] {
  return reviews.slice(-3);
}

export function isItemMastered(
  progress: UserProgress | undefined,
  grades: ReviewGrade[],
): boolean {
  if (!progress) {
    return false;
  }

  const accuracy = gradeToAccuracy(recentGrades(grades));
  return (
    accuracy !== undefined &&
    accuracy >= MASTERED_ACCURACY_THRESHOLD &&
    progress.intervalDays >= MASTERED_INTERVAL_DAYS
  );
}

export function doesItemNeedAttention(
  progress: UserProgress | undefined,
  grades: ReviewGrade[],
  nowIso: string,
): boolean {
  if (progress && progress.nextReviewAt <= nowIso) {
    return true;
  }

  const recent = recentGrades(grades);
  if (recent.length === 0) {
    return false;
  }

  const accuracy = gradeToAccuracy(recent);
  return accuracy !== undefined && accuracy < ATTENTION_ACCURACY_THRESHOLD;
}
