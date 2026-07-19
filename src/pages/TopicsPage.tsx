import { PageLayout } from '@/components/layout/PageLayout';
import { SourceForm, SourceList, useSources } from '@/features/sources';
import { TopicForm, TopicList, useTopics } from '@/features/topics';

export function TopicsPage() {
  const topicsState = useTopics();
  const sourcesState = useSources();

  return (
    <PageLayout
      title="Topics & sources"
      description="Organize items by JLPT topic and track where content comes from."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Topics</h2>
          <TopicForm onSubmit={topicsState.createTopic} />
          <TopicList
            topics={topicsState.topics}
            isLoading={topicsState.isLoading}
            error={topicsState.error}
            onDelete={topicsState.removeTopic}
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
