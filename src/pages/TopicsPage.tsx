import { useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SourceForm, SourceList, useSources } from '@/features/sources';
import { TopicForm, TopicList, useTopicProgress, useTopics } from '@/features/topics';

export function TopicsPage() {
  const topicsState = useTopics();
  const progressState = useTopicProgress();
  const sourcesState = useSources();

  const handleTopicDeleted = useCallback(
    async (id: string) => {
      await topicsState.removeTopic(id);
      progressState.reload();
    },
    [topicsState, progressState],
  );

  return (
    <PageLayout
      title="Topics & sources"
      description="Organize items by JLPT topic and track where content comes from."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Topics</h2>
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
