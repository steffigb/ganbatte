import type { ReactNode } from 'react';

type PlaceholderCardProps = {
  children: ReactNode;
};

export function PlaceholderCard({ children }: PlaceholderCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {children}
    </div>
  );
}
