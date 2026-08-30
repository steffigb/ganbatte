import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormAlert } from '@/components/ui/FormAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useItemRelations } from '@/features/items/hooks/useItemRelations';
import { KanjiReadingsBlock } from '@/features/review/components/KanjiReadings';
import type { LearningItem } from '@/types/learningItem';
import { cn } from '@/utils/cn';
import { formatItemMeaning } from '@/utils/meaningText';

type ItemListProps = {
  items: LearningItem[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
};

function itemDeleteLabel(item: LearningItem): string {
  return item.reading ? `${item.japanese} — ${item.reading}` : item.japanese;
}

export function ItemList({ items, isLoading, error, onDelete }: ItemListProps) {
  const relations = useItemRelations();
  const [pendingDelete, setPendingDelete] = useState<LearningItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (deleteFeedback?.variant !== 'success') {
      return;
    }

    const timer = window.setTimeout(() => setDeleteFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [deleteFeedback]);

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    const label = itemDeleteLabel(pendingDelete);
    setIsDeleting(true);

    try {
      await onDelete(pendingDelete.id);
      setDeleteFeedback({
        variant: 'success',
        message: `"${label}" was deleted.`,
      });
      setPendingDelete(null);
    } catch (cause) {
      setDeleteFeedback({
        variant: 'error',
        message: cause instanceof Error ? cause.message : 'Failed to delete item',
      });
    } finally {
      setIsDeleting(false);
    }
  }
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

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-green-300 p-4 text-sm text-green-700 dark:border-green-700 dark:text-green-400">
        No items yet.{' '}
        <Link to={routes.add} className="underline">
          Add your first item
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {deleteFeedback ? (
        <FormAlert variant={deleteFeedback.variant} message={deleteFeedback.message} />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete item?"
        message={
          pendingDelete
            ? `Do you really want to delete "${itemDeleteLabel(pendingDelete)}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        isConfirming={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!isDeleting) {
            setPendingDelete(null);
          }
        }}
      />

      <ul className="divide-y divide-green-200 rounded-xl border border-green-200 bg-white dark:divide-green-800 dark:border-green-800 dark:bg-green-900">
      {items.map((item) => {
        const itemRelations = relations?.get(item.id);
        const topics = itemRelations?.topics ?? [];
        const sources = itemRelations?.sources ?? [];

        return (
        <li
          key={item.id}
          className={cn(
            'flex items-start justify-between gap-4 px-4 py-3 text-sm',
            item.type === 'kanji' && 'py-4',
          )}
        >
          <div className="min-w-0 space-y-1">
            <Link
              to={routes.itemDetail(item.id)}
              className={cn(
                'block font-medium text-green-950 hover:underline dark:text-green-100',
                item.type === 'kanji' ? 'text-4xl leading-none' : 'text-base',
              )}
            >
              {item.japanese}
            </Link>
            {item.type === 'kanji' ? (
              <KanjiReadingsBlock item={item} />
            ) : item.reading ? (
              <p className="text-green-700 dark:text-green-400">{item.reading}</p>
            ) : null}
            <p className="text-green-700 dark:text-green-400">
              {formatItemMeaning(item.meaning, item.meaningAlt)}
            </p>
            <p className="text-green-700 dark:text-green-500">
              {item.level} · {item.type}
            </p>
            {topics.length > 0 ? (
              <p className="text-green-700 dark:text-green-500">
                Topics:{' '}
                {topics.map((topic, index) => (
                  <span key={topic.id}>
                    <Link
                      to={routes.topicDetail(topic.id)}
                      className="underline hover:text-green-800 dark:hover:text-green-300"
                    >
                      {topic.name}
                    </Link>
                    {index < topics.length - 1 ? ', ' : null}
                  </span>
                ))}
              </p>
            ) : null}
            {sources.length > 0 ? (
              <p className="text-green-700 dark:text-green-500">
                Sources:{' '}
                {sources
                  .map(({ source, reference }) =>
                    reference ? `${source.label} (${reference})` : source.label,
                  )
                  .join(', ')}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              to={`${routes.add}?edit=${item.id}`}
              className="rounded-lg border border-green-300 px-3 py-2 text-sm hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-800"
            >
              Edit
            </Link>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              disabled={isDeleting}
              onClick={() => setPendingDelete(item)}
            >
              Delete
            </Button>
          </div>
        </li>
        );
      })}
    </ul>
    </div>
  );
}
