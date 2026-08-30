import type { LevelFilter } from '@/features/items/hooks/useItems';
import { cn } from '@/utils/cn';

type LevelFilterTabsProps = {
  value: LevelFilter;
  onChange: (value: LevelFilter) => void;
};

export function LevelFilterTabs({ value, onChange }: LevelFilterTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-green-200 p-1 dark:border-green-700">
      {(['all', 'N4', 'N5'] as const).map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            'rounded-md px-3 py-1.5 text-sm',
            value === option
              ? 'bg-green-900 text-white dark:bg-green-100 dark:text-green-900'
              : 'text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800',
          )}
          onClick={() => onChange(option)}
        >
          {option === 'all' ? 'All' : option}
        </button>
      ))}
    </div>
  );
}
