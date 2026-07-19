import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Topic } from '@/types/topic';
import type { TopicProgress } from '@/types/topicProgress';

type TopicListProps = {
  topics: Topic[];
  progressByTopicId?: Map<string, TopicProgress>;
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
};

function formatTopicProgress(progress: TopicProgress | undefined): string | null {
  if (!progress || progress.itemCount === 0) {
    return null;
  }

  return `${progress.masteredCount}/${progress.itemCount} mastered · ${progress.masteryPercent}%`;
}

export function TopicList({
  topics,
  progressByTopicId,
  isLoading,
  error,
  onDelete,
}: TopicListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (topics.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        No topics yet. Create one above to organize your items.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {topics.map((topic) => {
        const progress = progressByTopicId?.get(topic.id);
        const progressLabel = formatTopicProgress(progress);

        return (
        <li
          key={topic.id}
          className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
        >
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">{topic.name}</p>
              {progress?.needsAttention ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Needs attention
                </span>
              ) : null}
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {topic.level} · {topic.skill}
              {progressLabel ? <span> · {progressLabel}</span> : null}
            </p>
            {topic.description ? (
              <p className="text-slate-600 dark:text-slate-400">{topic.description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            className="shrink-0 bg-red-700 hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
            onClick={() => void onDelete(topic.id)}
          >
            Delete
          </Button>
        </li>
        );
      })}
    </ul>
  );
}
