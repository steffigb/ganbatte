import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

export function Select({ label, id, options, className, ...props }: SelectProps) {
  return (
    <label htmlFor={id} className="block space-y-1.5 text-sm">
      <span className="font-medium text-green-800 dark:text-green-300">{label}</span>
      <select
        id={id}
        className={cn(
          'w-full rounded-lg border border-green-300 bg-white px-3 py-2',
          'text-green-950 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200',
          'dark:border-green-600 dark:bg-green-900 dark:text-green-100',
          'dark:focus:border-green-400 dark:focus:ring-green-800',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
