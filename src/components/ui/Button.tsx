import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white',
        'hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60',
        'dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
