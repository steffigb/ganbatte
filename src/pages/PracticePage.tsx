import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PracticeSession } from '@/features/practice/components/PracticeSession';
import { loadPracticeItems, type PracticeFilters } from '@/features/practice/practiceService';
import { useTopics } from '@/features/topics';
import type { JlptLevel, PartOfSpeech, Skill } from '@/types/domain';
import type { LearningItem } from '@/types/learningItem';
import { partOfSpeechLabel } from '@/utils/wordClassLabels';

const SKILL_OPTIONS: Array<{ value: Skill; label: string }> = [
  { value: 'kanji', label: 'Kanji' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
];

const PART_OF_SPEECH_OPTIONS: PartOfSpeech[] = [
  'noun',
  'verb',
  'i-adjective',
  'na-adjective',
  'adverb',
  'particle',
  'conjunction',
];

export function PracticePage() {
  const { user } = useAuth();
  const { topics } = useTopics();
  const [filters, setFilters] = useState<PracticeFilters>({});
  const [items, setItems] = useState<LearningItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadPracticeItems(user.id, filters);
      setItems(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load practice items');
    } finally {
      setIsLoading(false);
    }
  }

  if (items !== null) {
    if (isLoading) {
      return (
        <PageLayout title="Practice">
          <LoadingSpinner />
        </PageLayout>
      );
    }

    if (items.length === 0) {
      return (
        <PageLayout title="Practice">
          <div className="space-y-4">
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              No items match these filters.
            </p>
            <Button type="button" onClick={() => setItems(null)}>
              Change filters
            </Button>
          </div>
        </PageLayout>
      );
    }

    return (
      <PageLayout
        title="Practice"
        description="Extra reps, on your terms — this never touches your review schedule."
      >
        <PracticeSession items={items} onExit={() => setItems(null)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Practice"
      description="Drill N5 kanji, verbs, a topic, or anything you keep forgetting — independent of the SRS queue."
    >
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-slate-700 dark:text-slate-300">Skill</span>
            <select
              value={filters.skill ?? ''}
              onChange={(event) => {
                const skill = (event.target.value || undefined) as Skill | undefined;
                setFilters((current) => ({
                  ...current,
                  skill,
                  // Part of speech only applies to vocabulary.
                  partOfSpeech: skill && skill !== 'vocabulary' ? undefined : current.partOfSpeech,
                }));
              }}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Any skill</option>
              {SKILL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-slate-700 dark:text-slate-300">Level</span>
            <select
              value={filters.level ?? ''}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  level: (event.target.value || undefined) as JlptLevel | undefined,
                }))
              }
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Any level</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-slate-700 dark:text-slate-300">Part of speech</span>
            <select
              value={filters.partOfSpeech ?? ''}
              disabled={Boolean(filters.skill && filters.skill !== 'vocabulary')}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  partOfSpeech: (event.target.value || undefined) as PartOfSpeech | undefined,
                }))
              }
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Any part of speech</option>
              {PART_OF_SPEECH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {partOfSpeechLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-slate-700 dark:text-slate-300">Topic</span>
            <select
              value={filters.topicId ?? ''}
              onChange={(event) =>
                setFilters((current) => ({ ...current, topicId: event.target.value || undefined }))
              }
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Any topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={filters.strugglingOnly ?? false}
              onChange={(event) =>
                setFilters((current) => ({ ...current, strugglingOnly: event.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
            />
            <span className="text-slate-700 dark:text-slate-300">
              Only items I keep forgetting
            </span>
          </label>
        </div>

        <Button type="button" disabled={isLoading} onClick={() => void handleStart()}>
          Start practice
        </Button>
      </div>
    </PageLayout>
  );
}
