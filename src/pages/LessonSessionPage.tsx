import { Link, useParams } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { LessonSession, lessonGroups, type LessonGroup } from '@/features/learn';

const GROUP_TITLES: Record<LessonGroup, string> = {
  'kanji-vocab': 'Kanji & Vocabulary lessons',
  grammar: 'Grammar lessons',
  reading: 'Reading lessons',
  listening: 'Listening lessons',
};

export function LessonSessionPage() {
  const { group } = useParams<{ group: string }>();
  const isValidGroup = (lessonGroups as readonly string[]).includes(group ?? '');
  const lessonGroup = isValidGroup ? (group as LessonGroup) : undefined;

  return (
    <PageLayout
      title={lessonGroup ? GROUP_TITLES[lessonGroup] : 'Lessons'}
      description="No grading here — just get familiar with each item before it enters your reviews."
    >
      {!lessonGroup ? (
        <p className="rounded-xl border border-dashed border-green-300 p-4 text-sm text-green-700 dark:border-green-700 dark:text-green-400">
          Unknown lesson group.{' '}
          <Link to={routes.learnHub} className="underline">
            Back to Learn
          </Link>
          .
        </p>
      ) : (
        <LessonSession group={lessonGroup} />
      )}
    </PageLayout>
  );
}
