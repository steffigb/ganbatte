import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import type { WeakTopicSummary } from '@/features/dashboard/dashboardService';

type WeakTopicsListProps = {
  weakTopics: WeakTopicSummary[];
};

export function WeakTopicsList({ weakTopics }: WeakTopicsListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Weak topics</h2>
        <Link to={routes.topics} className="text-xs text-slate-500 underline dark:text-slate-400">
          All topics
        </Link>
      </div>

      {weakTopics.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          No topics flagged yet. Keep reviewing to build progress data.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {weakTopics.map(({ topic, progress }) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
            >
              <div>
                <Link
                  to={routes.topicDetail(topic.id)}
                  className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                >
                  {topic.name}
                </Link>
                <p className="text-slate-500 dark:text-slate-400">
                  {topic.level} · {topic.skill}
                </p>
              </div>
              <span className="shrink-0 text-slate-600 dark:text-slate-300">
                {progress.masteryPercent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
