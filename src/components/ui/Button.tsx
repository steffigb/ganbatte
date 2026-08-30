import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white',
        'hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60',
        'dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
