import { useCallback, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { SourceForm, SourceList, useSources } from '@/features/sources';
import { TopicForm, TopicList, useTopicProgress, useTopics } from '@/features/topics';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { bulkDeleteTopics } from '@/lib/maintenance';

export function TopicsPage() {
  const { user } = useAuth();
  const topicsState = useTopics();
  const progressState = useTopicProgress();
  const sourcesState = useSources();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleTopicDeleted = useCallback(
    async (id: string) => {
      await topicsState.removeTopic(id);
      progressState.reload();
    },
    [topicsState, progressState],
  );

  async function handleDeleteAllTopics() {
    if (!user) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      const deletedCount = await bulkDeleteTopics(user.id);
      setConfirmOpen(false);
      setFeedback({
        variant: 'success',
        message: `Deleted ${deletedCount} topic${deletedCount === 1 ? '' : 's'}. Click Sync now in the header to propagate deletes to Supabase.`,
      });
      topicsState.reload();
      progressState.reload();
    } catch (cause) {
      setFeedback({
        variant: 'error',
        message: cause instanceof Error ? cause.message : 'Failed to delete topics',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const topicCount = topicsState.topics.length;

  return (
    <PageLayout
      title="Topics & sources"
      description="Organize items by JLPT topic and track where content comes from."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Topics</h2>
            {topicCount > 0 ? (
              <Button
                type="button"
                className="bg-red-700 px-3 py-1.5 text-sm hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
                disabled={isDeleting}
                onClick={() => setConfirmOpen(true)}
              >
                Delete all topics
              </Button>
            ) : null}
          </div>
          {feedback ? <FormAlert variant={feedback.variant} message={feedback.message} /> : null}
          <TopicForm
            onSubmit={async (input) => {
              await topicsState.createTopic(input);
              progressState.reload();
            }}
          />
          <TopicList
            topics={topicsState.topics}
            progressByTopicId={progressState.progressByTopicId}
            isLoading={topicsState.isLoading || progressState.isLoading}
            error={topicsState.error ?? progressState.error}
            onDelete={handleTopicDeleted}
          />
          <ConfirmDialog
            open={confirmOpen}
            title="Delete all topics?"
            message={`Delete all ${topicCount} topic${topicCount === 1 ? '' : 's'}? Item–topic links are removed; your learning items stay. Sync afterward to update Supabase. This cannot be undone.`}
            confirmLabel="Delete all topics"
            cancelLabel="Keep"
            isConfirming={isDeleting}
            onConfirm={() => void handleDeleteAllTopics()}
            onCancel={() => {
              if (!isDeleting) {
                setConfirmOpen(false);
              }
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Sources</h2>
          <SourceForm onSubmit={sourcesState.createSource} />
          <SourceList
            sources={sourcesState.sources}
            isLoading={sourcesState.isLoading}
            error={sourcesState.error}
            onDelete={sourcesState.removeSource}
          />
        </section>
      </div>
    </PageLayout>
  );
}
