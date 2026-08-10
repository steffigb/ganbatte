import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormAlert } from '@/components/ui/FormAlert';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  bulkDeleteKanjiItems,
  countKanjiItems,
  countStartedItems,
  countTopics,
  countUnsetKanjiReadings,
  markUnsetKanjiReadingsAsNone,
  resetSkillProgress,
} from '@/lib/maintenance';
import { upsertAppSettings } from '@/lib/db';
import { ensureAppSettings } from '@/lib/settings';
import type { AppSettings } from '@/types/appSettings';

type CleanupCounts = {
  kanji: number;
  topics: number;
};

export function SettingsPage() {
  const { user, session } = useAuth();
  const [counts, setCounts] = useState<CleanupCounts | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unsetReadingCount, setUnsetReadingCount] = useState<number | null>(null);
  const [confirmFixReadingsOpen, setConfirmFixReadingsOpen] = useState(false);
  const [isFixingReadings, setIsFixingReadings] = useState(false);
  const [startedCount, setStartedCount] = useState<number | null>(null);
  const [confirmResetProgressOpen, setConfirmResetProgressOpen] = useState(false);
  const [isResettingProgress, setIsResettingProgress] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingCount(true);
      try {
        const [kanji, topics, unsetReadings, started, loadedSettings] = await Promise.all([
          countKanjiItems(user.id),
          countTopics(user.id),
          countUnsetKanjiReadings(user.id),
          countStartedItems(user.id),
          ensureAppSettings(user.id),
        ]);
        if (!cancelled) {
          setCounts({ kanji, topics });
          setUnsetReadingCount(unsetReadings);
          setStartedCount(started);
          setSettings(loadedSettings);
        }
      } catch (cause) {
        if (!cancelled) {
          setFeedback({
            variant: 'error',
            message: cause instanceof Error ? cause.message : 'Failed to load counts',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCount(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDefaultLessonSizeChange(value: number) {
    if (!settings || Number.isNaN(value) || value < 0) {
      return;
    }

    const updated: AppSettings = { ...settings, defaultLessonSize: value };
    setSettings(updated);
    setIsSavingSettings(true);

    try {
      await upsertAppSettings(updated);
    } catch (cause) {
      setFeedback({
        variant: 'error',
        message: cause instanceof Error ? cause.message : 'Failed to save settings',
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleConfirmDelete() {
    if (!user) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      const result = await bulkDeleteKanjiItems(user.id);
      setCounts({ kanji: 0, topics: 0 });
      setConfirmOpen(false);

      const parts: string[] = [];
      if (result.deletedCount > 0) {
        parts.push(
          `${result.deletedCount} kanji item${result.deletedCount === 1 ? '' : 's'}`,
        );
      }
      if (result.topicCount > 0) {
        parts.push(`${result.topicCount} topic${result.topicCount === 1 ? '' : 's'}`);
      }
      if (result.batchCount > 0) {
        parts.push(
          `${result.batchCount} import batch${result.batchCount === 1 ? '' : 'es'}`,
        );
      }

      setFeedback({
        variant: 'success',
        message: `Deleted ${parts.join(', ') || 'nothing'}. Click Sync now in the header to propagate deletes to Supabase.`,
      });
    } catch (cause) {
      setFeedback({
        variant: 'error',
        message: cause instanceof Error ? cause.message : 'Failed to delete data',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConfirmFixReadings() {
    if (!user) {
      return;
    }

    setIsFixingReadings(true);
    setFeedback(null);

    try {
      const result = await markUnsetKanjiReadingsAsNone(user.id);
      setUnsetReadingCount(0);
      setConfirmFixReadingsOpen(false);
      setFeedback({
        variant: 'success',
        message:
          result.fieldCount > 0
            ? `Marked ${result.fieldCount} reading${result.fieldCount === 1 ? '' : 's'} across ${result.itemCount} kanji as confirmed absent. Click Sync now in the header to propagate the change to Supabase.`
            : 'Nothing to fix — no unset readings found.',
      });
    } catch (cause) {
      setFeedback({
        variant: 'error',
        message: cause instanceof Error ? cause.message : 'Failed to update readings',
      });
    } finally {
      setIsFixingReadings(false);
    }
  }

  async function handleConfirmResetProgress() {
    if (!user) {
      return;
    }

    setIsResettingProgress(true);
    setFeedback(null);

    try {
      const result = await resetSkillProgress(user.id);
      setStartedCount(0);
      setConfirmResetProgressOpen(false);
      setFeedback({
        variant: 'success',
        message:
          result.itemCount > 0
            ? `Reset ${result.itemCount} kanji/vocabulary/grammar item${result.itemCount === 1 ? '' : 's'} to not started, deleting ${result.reviewCount} review${result.reviewCount === 1 ? '' : 's'}. Click Sync now in the header to propagate the change to Supabase.`
            : 'Nothing to reset — no items have started yet.',
      });
    } catch (cause) {
      setFeedback({
        variant: 'error',
        message: cause instanceof Error ? cause.message : 'Failed to reset progress',
      });
    } finally {
      setIsResettingProgress(false);
    }
  }

  const kanjiLabel =
    counts === null ? (isLoadingCount ? '…' : '—') : String(counts.kanji);
  const topicLabel =
    counts === null ? (isLoadingCount ? '…' : '—') : String(counts.topics);
  const nothingToDelete =
    counts !== null && counts.kanji === 0 && counts.topics === 0;
  const unsetReadingLabel =
    unsetReadingCount === null ? (isLoadingCount ? '…' : '—') : String(unsetReadingCount);
  const nothingToFix = unsetReadingCount === 0;
  const startedLabel =
    startedCount === null ? (isLoadingCount ? '…' : '—') : String(startedCount);
  const nothingToReset = startedCount === 0;

  return (
    <PageLayout title="Settings" description="Exam date, daily goals, sync, and backup.">
      <div className="space-y-4">
        {feedback ? <FormAlert variant={feedback.variant} message={feedback.message} /> : null}

        <PlaceholderCard>
          <p>
            Signed in as <strong>{user?.email ?? 'unknown'}</strong>
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Session expires:{' '}
            {session?.expires_at
              ? new Date(session.expires_at * 1000).toLocaleString('de-DE')
              : '—'}
          </p>
        </PlaceholderCard>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Lesson size
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            How many brand-new items a lesson session suggests by default. Each time you start
            a lesson you can change the number and pick exactly which items to learn.
          </p>
          <label className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-slate-700 dark:text-slate-300">Items per lesson</span>
            <input
              type="number"
              min={1}
              max={50}
              value={settings?.defaultLessonSize ?? ''}
              disabled={!settings || isSavingSettings}
              onChange={(event) => void handleDefaultLessonSizeChange(Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
        </section>

        <PlaceholderCard>
          Exam date, sync, and export settings will be added here.
        </PlaceholderCard>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Kanji readings
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            You currently have <strong>{unsetReadingLabel}</strong> onyomi/kunyomi field
            {unsetReadingCount === 1 ? '' : 's'} marked "not set".
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Marks every unconfirmed onyomi/kunyomi as confirmed-absent, so it displays as
            "—" instead of "not set". Run this again after importing more kanji.
          </p>
          <Button
            type="button"
            className="mt-4"
            disabled={!user || isFixingReadings || nothingToFix}
            onClick={() => setConfirmFixReadingsOpen(true)}
          >
            Mark unset readings as confirmed absent
          </Button>
        </section>

        <ConfirmDialog
          open={confirmFixReadingsOpen}
          title="Mark unset readings as confirmed absent?"
          message={`Mark ${unsetReadingLabel} unset onyomi/kunyomi field${unsetReadingCount === 1 ? '' : 's'} as confirmed-absent? They'll display as "—" instead of "not set". You can still edit any kanji individually afterward.`}
          confirmLabel="Mark as absent"
          cancelLabel="Cancel"
          isConfirming={isFixingReadings}
          onConfirm={() => void handleConfirmFixReadings()}
          onCancel={() => {
            if (!isFixingReadings) {
              setConfirmFixReadingsOpen(false);
            }
          }}
        />

        <section className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">Danger zone</h2>
          <p className="mt-2 text-sm text-red-800 dark:text-red-300">
            You currently have <strong>{kanjiLabel}</strong> kanji item
            {counts?.kanji === 1 ? '' : 's'} and <strong>{topicLabel}</strong> topic
            {counts?.topics === 1 ? '' : 's'}.
          </p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">
            This removes all kanji and topics from Study, Learn, and Search. Item–topic links
            are removed; vocabulary and other items stay. Sync afterward to update Supabase.
          </p>
          <Button
            type="button"
            className="mt-4 bg-red-700 hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
            disabled={!user || isDeleting || nothingToDelete}
            onClick={() => setConfirmOpen(true)}
          >
            Delete all kanji and topics
          </Button>

          <p className="mt-6 text-sm text-red-800 dark:text-red-300">
            You currently have <strong>{startedLabel}</strong> kanji/vocabulary/grammar item
            {startedCount === 1 ? '' : 's'} with SRS progress.
          </p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">
            Resets kanji, vocabulary, and grammar items to "not started" — deletes their SRS
            progress and review history so they re-enter Lessons as brand-new. Items, topics,
            and sources stay. Sync afterward to update Supabase.
          </p>
          <Button
            type="button"
            className="mt-4 bg-red-700 hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
            disabled={!user || isResettingProgress || nothingToReset}
            onClick={() => setConfirmResetProgressOpen(true)}
          >
            Reset kanji, vocabulary &amp; grammar to not started
          </Button>
        </section>

        <ConfirmDialog
          open={confirmOpen}
          title="Delete all kanji and topics?"
          message={
            counts !== null
              ? `Delete all ${counts.kanji} kanji item${counts.kanji === 1 ? '' : 's'} and ${counts.topics} topic${counts.topics === 1 ? '' : 's'}? This cannot be undone. Sync will propagate deletes to Supabase.`
              : ''
          }
          confirmLabel="Delete all"
          cancelLabel="Keep"
          isConfirming={isDeleting}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => {
            if (!isDeleting) {
              setConfirmOpen(false);
            }
          }}
        />

        <ConfirmDialog
          open={confirmResetProgressOpen}
          title="Reset progress to not started?"
          message={`Reset ${startedLabel} kanji/vocabulary/grammar item${startedCount === 1 ? '' : 's'} to not started? This deletes their SRS progress and full review history — it cannot be undone. Items themselves are kept and will re-enter Lessons as brand-new. Sync will propagate the change to Supabase.`}
          confirmLabel="Reset progress"
          cancelLabel="Keep"
          isConfirming={isResettingProgress}
          onConfirm={() => void handleConfirmResetProgress()}
          onCancel={() => {
            if (!isResettingProgress) {
              setConfirmResetProgressOpen(false);
            }
          }}
        />
      </div>
    </PageLayout>
  );
}
