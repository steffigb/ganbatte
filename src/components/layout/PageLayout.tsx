import type { ReactNode } from 'react';

type PageLayoutProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
