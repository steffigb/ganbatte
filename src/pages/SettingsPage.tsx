import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormAlert } from '@/components/ui/FormAlert';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { bulkDeleteKanjiItems, countKanjiItems, countTopics } from '@/lib/maintenance';

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
        const [kanji, topics] = await Promise.all([
          countKanjiItems(user.id),
          countTopics(user.id),
        ]);
        if (!cancelled) {
          setCounts({ kanji, topics });
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

  const kanjiLabel =
    counts === null ? (isLoadingCount ? '…' : '—') : String(counts.kanji);
  const topicLabel =
    counts === null ? (isLoadingCount ? '…' : '—') : String(counts.topics);
  const nothingToDelete =
    counts !== null && counts.kanji === 0 && counts.topics === 0;

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

        <PlaceholderCard>
          Exam date, sync, and export settings will be added here.
        </PlaceholderCard>

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
      </div>
    </PageLayout>
  );
}
