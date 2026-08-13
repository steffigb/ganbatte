import {
  listItemSourcesByUser,
  listSourcesByUser,
} from '@/lib/db';
import {
  defaultSearchFilters,
  findSimilarItemsLocal,
  searchLocal,
  type ItemSearchResult,
  type ItemSearchSource,
  type SearchFilters,
  type SearchResults,
} from '@/lib/search';
import { loadStudyContext } from '@/lib/study';
import type { ItemType } from '@/types/domain';
import type { Source } from '@/types/source';

function buildSourceEntriesByItemId(
  itemSources: Array<{ itemId: string; sourceId: string; reference?: string }>,
  sourcesById: Map<string, Source>,
): Map<string, ItemSearchSource[]> {
  const sourceEntriesByItemId = new Map<string, ItemSearchSource[]>();

  for (const link of itemSources) {
    const source = sourcesById.get(link.sourceId);
    if (!source) {
      continue;
    }

    const existing = sourceEntriesByItemId.get(link.itemId) ?? [];
    existing.push({ label: source.label, reference: link.reference });
    sourceEntriesByItemId.set(link.itemId, existing);
  }

  return sourceEntriesByItemId;
}

function buildSourceMetaByItemId(
  sourceEntriesByItemId: Map<string, ItemSearchSource[]>,
): Map<string, string[]> {
  const sourceMetaByItemId = new Map<string, string[]>();

  for (const [itemId, entries] of sourceEntriesByItemId) {
    sourceMetaByItemId.set(
      itemId,
      entries.flatMap((entry) => [entry.label, entry.reference].filter(
        (value): value is string => Boolean(value),
      )),
    );
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
  const sourceEntriesByItemId = buildSourceEntriesByItemId(itemSources, sourcesById);
  const sourceMetaByItemId = buildSourceMetaByItemId(sourceEntriesByItemId);
  const topicProgressById = new Map(
    context.topicProgress.map((entry) => [entry.topicId, entry]),
  );

  return {
    ...context,
    sourceMetaByItemId,
    sourceEntriesByItemId,
    topicProgressById,
  };
}

export async function searchAll(
  userId: string,
  query: string,
  filters: SearchFilters = defaultSearchFilters,
): Promise<SearchResults> {
  const trimmed = query.trim();
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
    sourceEntriesByItemId: context.sourceEntriesByItemId,
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
      sourceEntriesByItemId: context.sourceEntriesByItemId,
      now: new Date().toISOString(),
    },
    options,
  );
}

export { defaultSearchFilters, type SearchFilters, type SearchResults };
