import { Button } from '@/components/ui/Button';
import type { ReviewGrade } from '@/types/review';

type GradeOption = {
  grade: ReviewGrade;
  label: string;
  className: string;
};

const GRADE_OPTIONS: GradeOption[] = [
  {
    grade: 0,
    label: 'Again',
    className: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
  },
  {
    grade: 2,
    label: 'Hard',
    className: 'bg-amber-700 hover:bg-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800',
  },
  {
    grade: 4,
    label: 'Good',
    className: 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-900 dark:hover:bg-emerald-800',
  },
  {
    grade: 5,
    label: 'Easy',
    className: 'bg-sky-700 hover:bg-sky-800 dark:bg-sky-900 dark:hover:bg-sky-800',
  },
];

type ReviewActionsProps = {
  visible: boolean;
  disabled?: boolean;
  onGrade: (grade: ReviewGrade) => void;
};

export function ReviewActions({ visible, disabled, onGrade }: ReviewActionsProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {GRADE_OPTIONS.map((option) => (
        <Button
          key={option.grade}
          type="button"
          disabled={disabled}
          className={option.className}
          onClick={() => onGrade(option.grade)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
