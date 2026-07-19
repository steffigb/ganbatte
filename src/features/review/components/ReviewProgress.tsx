type ReviewProgressProps = {
  current: number;
  total: number;
};

export function ReviewProgress({ current, total }: ReviewProgressProps) {
  if (total === 0) {
    return null;
  }

  const completed = Math.min(current, total);
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          Card {Math.min(current + 1, total)} of {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-slate-900 transition-all dark:bg-slate-100"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
