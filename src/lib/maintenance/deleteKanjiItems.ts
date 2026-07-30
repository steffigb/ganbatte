import {
  deleteImportBatch,
  deleteItemSource,
  deleteItemTopic,
  deleteReview,
  getUserProgressByItem,
  listImportBatchesByUser,
  listItemSourcesByItem,
  listItemTopicsByItem,
  listItemTopicsByTopic,
  listItemsByUser,
  listReviewsByItem,
  listTopicsByUser,
  softDeleteItem,
  softDeleteTopic,
  deleteUserProgress,
} from '@/lib/db';

export type BulkDeleteKanjiResult = {
  deletedCount: number;
  topicCount: number;
  batchCount: number;
};

export async function countKanjiItems(userId: string): Promise<number> {
  const items = await listItemsByUser(userId);
  return items.filter((item) => item.type === 'kanji').length;
}

export async function countTopics(userId: string): Promise<number> {
  return (await listTopicsByUser(userId)).length;
}

async function deleteKanjiRelatedRecords(itemId: string, userId: string): Promise<void> {
  const [reviews, topicLinks, sourceLinks, progress] = await Promise.all([
    listReviewsByItem(itemId),
    listItemTopicsByItem(itemId),
    listItemSourcesByItem(itemId),
    getUserProgressByItem(userId, itemId),
  ]);

  for (const review of reviews) {
    await deleteReview(review.id);
  }

  if (progress) {
    await deleteUserProgress(progress.id);
  }

  for (const link of topicLinks) {
    await deleteItemTopic(link.id);
  }

  for (const link of sourceLinks) {
    await deleteItemSource(link.id);
  }
}

async function deleteTopicWithLinks(topicId: string): Promise<void> {
  const topicLinks = await listItemTopicsByTopic(topicId);
  for (const link of topicLinks) {
    await deleteItemTopic(link.id);
  }
  await softDeleteTopic(topicId);
}

export async function bulkDeleteTopics(userId: string): Promise<number> {
  const topics = await listTopicsByUser(userId);
  for (const topic of topics) {
    await deleteTopicWithLinks(topic.id);
  }
  return topics.length;
}

export async function bulkDeleteKanjiItems(userId: string): Promise<BulkDeleteKanjiResult> {
  const kanjiItems = (await listItemsByUser(userId)).filter((item) => item.type === 'kanji');

  for (const item of kanjiItems) {
    await deleteKanjiRelatedRecords(item.id, userId);
    await softDeleteItem(item.id);
  }

  const importBatches = await listImportBatchesByUser(userId);
  for (const batch of importBatches) {
    await deleteImportBatch(batch.id);
  }

  const topicCount = await bulkDeleteTopics(userId);

  return {
    deletedCount: kanjiItems.length,
    topicCount,
    batchCount: importBatches.length,
  };
}
