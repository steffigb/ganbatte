import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { learnSkills, routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { ItemList, useItems } from '@/features/items';
import type { JlptLevel, Skill } from '@/types/domain';
import { cn } from '@/utils/cn';

export function LearnBrowsePage() {
  const { skill } = useParams<{ skill: string }>();
  const isValidSkill = learnSkills.includes(skill as (typeof learnSkills)[number]);
  const browseSkill = isValidSkill ? (skill as Skill) : undefined;
  const [level, setLevel] = useState<JlptLevel>('N4');

  const { items, isLoading, error, removeItem } = useItems({
    skill: browseSkill,
    level: browseSkill ? level : undefined,
  });

  return (
    <PageLayout
      title={browseSkill ? `Learn — ${browseSkill}` : 'Learn'}
      description="Browse items by skill, level, topic, and source."
    >
      {!isValidSkill ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          Unknown skill. Use vocabulary, kanji, grammar, reading, or listening.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 p-1 dark:border-slate-700">
              {(['N4', 'N5'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm',
                    level === option
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                  onClick={() => setLevel(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <Link
              to={routes.add}
              className="text-sm font-medium text-slate-700 underline dark:text-slate-300"
            >
              Add item
            </Link>
          </div>

          <ItemList
            items={items}
            isLoading={isLoading}
            error={error}
            onDelete={removeItem}
          />
        </div>
      )}
    </PageLayout>
  );
}
