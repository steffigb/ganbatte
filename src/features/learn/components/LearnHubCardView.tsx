import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { LogPracticeForm } from '@/features/activity/components/LogPracticeForm';
import type { LearnHubCard } from '@/features/learn/learnHubService';
import { jlptN4ListeningResources } from '@/features/listening/resources';

type LearnHubCardViewProps = {
  card: LearnHubCard;
};

const BROWSE_LINKS: Record<LearnHubCard['group'], Array<{ skill: string; label: string }>> = {
  'kanji-vocab': [
    { skill: 'vocabulary', label: 'Browse vocabulary' },
    { skill: 'kanji', label: 'Browse kanji' },
  ],
  grammar: [{ skill: 'grammar', label: 'Browse all' }],
  reading: [{ skill: 'reading', label: 'Browse all' }],
  listening: [{ skill: 'listening', label: 'Browse all' }],
};

export function LearnHubCardView({ card }: LearnHubCardViewProps) {
  const inProgress = Math.max(0, card.totalItems - card.masteredItems - card.lessonsAvailable);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {card.label}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {card.totalItems} item{card.totalItems === 1 ? '' : 's'} · {card.masteredItems} mastered
          {inProgress > 0 ? ` · ${inProgress} in progress` : ''}
          {card.lessonsAvailable > 0 ? ` · ${card.lessonsAvailable} not started` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={routes.lessons(card.group)}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Start lessons ({card.lessonsAvailableToday})
        </Link>
        {card.hasReviews ? (
          <Link
            to={routes.study}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Start reviews ({card.reviewsDue})
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {BROWSE_LINKS[card.group].map((link) => (
          <Link key={link.skill} to={routes.learn(link.skill)} className="text-slate-600 underline dark:text-slate-400">
            {link.label}
          </Link>
        ))}
      </div>

      {card.group === 'reading' || card.group === 'listening' ? (
        <div className="pt-1">
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            Practicing with material outside the app (a textbook, a video)? Log it directly:
          </p>
          <LogPracticeForm skill={card.group} />
        </div>
      ) : null}

      {card.group === 'listening' ? (
        <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Useful N4 listening resources
          </p>
          <ul className="space-y-2">
            {jlptN4ListeningResources.map((resource) => (
              <li key={resource.url} className="text-sm">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-900 underline dark:text-slate-100"
                >
                  {resource.title}
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-400">{resource.description}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tip: add your own YouTube or textbook links as Sources (skill: listening), then log
            minutes here after each session.
          </p>
        </div>
      ) : null}
    </div>
  );
}
