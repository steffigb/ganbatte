import {
  listItemSourcesByUser,
  listSourcesByUser,
} from '@/lib/db';
import {
  defaultSearchFilters,
  emptySearchResults,
  findSimilarItemsLocal,
  searchLocal,
  type ItemSearchResult,
  type SearchFilters,
  type SearchResults,
} from '@/lib/search';
import { loadStudyContext } from '@/lib/study';
import type { ItemType } from '@/types/domain';
import type { Source } from '@/types/source';

function buildSourceMetaByItemId(
  itemSources: Array<{ itemId: string; sourceId: string; reference?: string }>,
  sourcesById: Map<string, Source>,
): Map<string, string[]> {
  const sourceMetaByItemId = new Map<string, string[]>();

  for (const link of itemSources) {
    const source = sourcesById.get(link.sourceId);
    const meta = [source?.label, link.reference].filter(
      (value): value is string => Boolean(value),
    );

    if (meta.length === 0) {
      continue;
    }

    const existing = sourceMetaByItemId.get(link.itemId) ?? [];
    existing.push(...meta);
    sourceMetaByItemId.set(link.itemId, existing);
  }

  return sourceMetaByItemId;
}

async function loadSearchContext(userId: string) {
  const [context, sources, itemSources] = await Promise.all([
    loadStudyContext(userId),
    listSourcesByUser(userId),
    listItemSourcesByUser(userId),
  ]);

  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const sourceMetaByItemId = buildSourceMetaByItemId(itemSources, sourcesById);
  const topicProgressById = new Map(
    context.topicProgress.map((entry) => [entry.topicId, entry]),
  );

  return {
    ...context,
    sourceMetaByItemId,
    topicProgressById,
  };
}

export async function searchAll(
  userId: string,
  query: string,
  filters: SearchFilters = defaultSearchFilters,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return emptySearchResults();
  }

  const context = await loadSearchContext(userId);

  return searchLocal({
    query: trimmed,
    filters,
    items: context.items,
    topics: context.topics,
    progressByItemId: context.progressByItemId,
    gradesByItemId: context.gradesByItemId,
    topicProgressById: context.topicProgressById,
    sourceMetaByItemId: context.sourceMetaByItemId,
    now: new Date().toISOString(),
  });
}

export async function findSimilarItems(
  userId: string,
  query: string,
  options?: { type?: ItemType; excludeItemId?: string; limit?: number },
): Promise<ItemSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const context = await loadSearchContext(userId);

  return findSimilarItemsLocal(
    {
      query: trimmed,
      items: context.items,
      progressByItemId: context.progressByItemId,
      gradesByItemId: context.gradesByItemId,
      sourceMetaByItemId: context.sourceMetaByItemId,
      now: new Date().toISOString(),
    },
    options,
  );
}

export { defaultSearchFilters, type SearchFilters, type SearchResults };
