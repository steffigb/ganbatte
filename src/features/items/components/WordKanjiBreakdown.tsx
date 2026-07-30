import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { findKanjiItemsByCharacters } from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import { extractKanjiCharacters } from '@/utils/japaneseText';

type WordKanjiBreakdownProps = {
  userId: string;
  japanese: string;
};

export function WordKanjiBreakdown({ userId, japanese }: WordKanjiBreakdownProps) {
  const characters = extractKanjiCharacters(japanese);
  const [kanjiItems, setKanjiItems] = useState<LearningItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void findKanjiItemsByCharacters(userId, extractKanjiCharacters(japanese)).then((items) => {
      if (!cancelled) {
        setKanjiItems(items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, japanese]);

  if (characters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Made of</p>
      <ul className="flex flex-wrap gap-2">
        {characters.map((char) => {
          const kanjiItem = kanjiItems.find((item) => item.japanese === char);

          return (
            <li key={char}>
              {kanjiItem ? (
                <Link
                  to={routes.itemDetail(kanjiItem.id)}
                  className="flex flex-col items-center rounded-lg border border-slate-200 px-3 py-2 text-center hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span className="text-2xl">{char}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {kanjiItem.meaning}
                  </span>
                </Link>
              ) : (
                <span className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 px-3 py-2 text-center text-slate-400 dark:border-slate-700">
                  <span className="text-2xl">{char}</span>
                  <span className="text-xs">not in list</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
