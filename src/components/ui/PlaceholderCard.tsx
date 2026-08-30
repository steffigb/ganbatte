import type { ReactNode } from 'react';

type PlaceholderCardProps = {
  children: ReactNode;
};

export function PlaceholderCard({ children }: PlaceholderCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-green-300 bg-white p-6 text-sm text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-400">
      {children}
    </div>
  );
}
