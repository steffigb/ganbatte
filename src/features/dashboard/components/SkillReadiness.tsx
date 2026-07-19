const SKILL_LABELS = {
  vocabulary: 'Vocabulary',
  kanji: 'Kanji',
  grammar: 'Grammar',
  reading: 'Reading',
  listening: 'Listening',
} as const;

type SkillReadinessProps = {
  skillReadiness: Record<keyof typeof SKILL_LABELS, number>;
};

export function SkillReadiness({ skillReadiness }: SkillReadinessProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Readiness by skill</h2>
      <ul className="mt-3 space-y-2">
        {(Object.keys(SKILL_LABELS) as Array<keyof typeof SKILL_LABELS>).map((skill) => {
          const percent = skillReadiness[skill];

          return (
            <li key={skill}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{SKILL_LABELS[skill]}</span>
                <span className="text-slate-500 dark:text-slate-400">{percent}%</span>
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
