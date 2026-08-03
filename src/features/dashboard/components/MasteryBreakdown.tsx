import type { MasteryCounts } from '@/lib/dashboard';

const TIER_LABELS: Array<{ key: keyof MasteryCounts; label: string }> = [
  { key: 'new', label: 'New' },
  { key: 'learning', label: 'Learning' },
  { key: 'familiar', label: 'Familiar' },
  { key: 'mastered', label: 'Mastered' },
];

type MasteryBreakdownProps = {
  masteryCounts: MasteryCounts;
};

export function MasteryBreakdown({ masteryCounts }: MasteryBreakdownProps) {
  const total = TIER_LABELS.reduce((sum, tier) => sum + masteryCounts[tier.key], 0);
  const known = masteryCounts.familiar + masteryCounts.mastered;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        What you already know
      </p>
      <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {known} <span className="text-lg font-normal text-slate-500 dark:text-slate-400">/ {total}</span>
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Familiar or mastered vocabulary, kanji, and grammar items
      </p>

      <ul className="mt-4 space-y-2">
        {TIER_LABELS.map((tier) => {
          const count = masteryCounts[tier.key];
          const percent = total === 0 ? 0 : Math.round((count / total) * 100);

          return (
            <li key={tier.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{tier.label}</span>
                <span className="text-slate-500 dark:text-slate-400">{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
