import { Link, useParams } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ItemList } from '@/features/items';
import { useTopicDetail } from '@/features/topics';
import { getTopicProgressByTopicId } from '@/features/topics/topicProgressService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import type { TopicProgress } from '@/types/topicProgress';

export function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { topic, items, isLoading, error, removeItem } = useTopicDetail(id);
  const [progress, setProgress] = useState<TopicProgress | undefined>(undefined);

  useEffect(() => {
    if (!user || !id) {
      return;
    }

    let cancelled = false;
    void getTopicProgressByTopicId(user.id, id).then((result) => {
      if (!cancelled) {
        setProgress(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, id]);

  if (isLoading) {
    return (
      <PageLayout title="Topic">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Topic">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      </PageLayout>
    );
  }

  if (!topic) {
    return (
      <PageLayout title="Topic not found">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This topic doesn&apos;t exist or was deleted.{' '}
          <Link to={routes.topics} className="underline">
            Back to topics
          </Link>
          .
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={topic.name} description={topic.description}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={routes.topics}
            className="text-sm font-medium text-slate-600 underline dark:text-slate-400"
          >
            ← All topics
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              {topic.level} · {topic.skill}
            </span>
            {progress && progress.itemCount > 0 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                {progress.masteredCount}/{progress.itemCount} mastered · {progress.masteryPercent}%
              </span>
            ) : null}
            {progress?.needsAttention ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Needs attention
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Items in this topic ({items.length})
          </h2>
        </div>

        <ItemList items={items} isLoading={false} error={null} onDelete={removeItem} />
      </div>
    </PageLayout>
  );
}
