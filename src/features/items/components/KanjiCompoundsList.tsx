import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { findVocabularyItemsContainingKanji } from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import { formatItemMeaning } from '@/utils/meaningText';

type KanjiCompoundsListProps = {
  userId: string;
  kanjiCharacter: string;
  /** When true, compounds link to their own detail page. */
  linkToDetail?: boolean;
};

export function KanjiCompoundsList({
  userId,
  kanjiCharacter,
  linkToDetail = false,
}: KanjiCompoundsListProps) {
  const [compounds, setCompounds] = useState<LearningItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void findVocabularyItemsContainingKanji(userId, kanjiCharacter).then((items) => {
      if (!cancelled) {
        setCompounds(items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, kanjiCharacter]);

  if (compounds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-green-800 dark:text-green-300">Compounds</p>
      <div className="space-y-2">
        {compounds.map((compound) => {
          const content = (
            <div className="rounded-lg bg-green-50 p-3 text-sm dark:bg-green-800">
              <p className="text-green-950 dark:text-green-100">{compound.japanese}</p>
              {compound.reading ? (
                <p className="mt-1 text-green-700 dark:text-green-400">{compound.reading}</p>
              ) : null}
              <p className="mt-1 text-green-700 dark:text-green-300">
                {formatItemMeaning(compound.meaning, compound.meaningAlt)}
              </p>
            </div>
          );

          return linkToDetail ? (
            <Link key={compound.id} to={routes.itemDetail(compound.id)} className="block">
              {content}
            </Link>
          ) : (
            <div key={compound.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
