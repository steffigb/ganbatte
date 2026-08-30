import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  return (
    <label htmlFor={id} className="block space-y-1.5 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <textarea
        id={id}
        className={cn(
          'min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2',
          'text-slate-900 placeholder:text-slate-400',
          'focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200',
          'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
          'dark:focus:border-slate-400 dark:focus:ring-slate-800',
          className,
        )}
        {...props}
      />
    </label>
  );
}
