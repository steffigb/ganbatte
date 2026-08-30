import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { findKanjiItemsByCharacters, findVocabularyItemsInText } from '@/lib/db';
import type { LearningItem } from '@/types/learningItem';
import { extractKanjiCharacters } from '@/utils/japaneseText';
import { formatItemMeaning } from '@/utils/meaningText';

type ExampleReferencesProps = {
  userId: string;
  example?: string;
};

/** Vocabulary + kanji found in a grammar item's example sentence — derived live, see exampleReferenceLookup.ts. */
export function ExampleReferences({ userId, example }: ExampleReferencesProps) {
  const [vocabulary, setVocabulary] = useState<LearningItem[]>([]);
  const [kanji, setKanji] = useState<LearningItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const text = example ?? '';

    void Promise.all([
      findVocabularyItemsInText(userId, text),
      findKanjiItemsByCharacters(userId, extractKanjiCharacters(text)),
    ]).then(([vocabItems, kanjiItems]) => {
      if (!cancelled) {
        setVocabulary(vocabItems);
        setKanji(kanjiItems);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, example]);

  if (vocabulary.length === 0 && kanji.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">In this example</p>
      <div className="flex flex-wrap gap-2">
        {vocabulary.map((item) => (
          <Link
            key={item.id}
            to={routes.itemDetail(item.id)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {item.japanese} · {formatItemMeaning(item.meaning, item.meaningAlt)}
          </Link>
        ))}
        {kanji.map((item) => (
          <Link
            key={item.id}
            to={routes.itemDetail(item.id)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {item.japanese} · {item.meaning}
          </Link>
        ))}
      </div>
    </div>
  );
}
