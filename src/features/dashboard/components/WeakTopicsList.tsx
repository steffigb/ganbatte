import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import type { WeakTopicSummary } from '@/features/dashboard/dashboardService';

type WeakTopicsListProps = {
  weakTopics: WeakTopicSummary[];
};

export function WeakTopicsList({ weakTopics }: WeakTopicsListProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-white p-4 dark:border-green-800 dark:bg-green-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-green-950 dark:text-green-100">Weak topics</h2>
        <Link to={routes.topics} className="text-xs text-green-700 underline dark:text-green-400">
          All topics
        </Link>
      </div>

      {weakTopics.length === 0 ? (
        <p className="mt-3 text-sm text-green-700 dark:text-green-400">
          No topics flagged yet. Keep reviewing to build progress data.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {weakTopics.map(({ topic, progress }) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-800"
            >
              <div>
                <Link
                  to={routes.topicDetail(topic.id)}
                  className="font-medium text-green-950 hover:underline dark:text-green-100"
                >
                  {topic.name}
                </Link>
                <p className="text-green-700 dark:text-green-400">
                  {topic.level} · {topic.skill}
                </p>
              </div>
              <span className="shrink-0 text-green-700 dark:text-green-300">
                {progress.masteryPercent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
