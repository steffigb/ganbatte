import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, className, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="block space-y-1.5 text-sm">
      <span className="font-medium text-green-800 dark:text-green-300">{label}</span>
      <input
        id={id}
        className={cn(
          'w-full rounded-lg border border-green-300 bg-white px-3 py-2',
          'text-green-950 placeholder:text-green-600',
          'focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200',
          'dark:border-green-600 dark:bg-green-900 dark:text-green-100',
          'dark:focus:border-green-400 dark:focus:ring-green-800',
          className,
        )}
        {...props}
      />
    </label>
  );
}
