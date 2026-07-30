import type { AppSettings } from '@/types/appSettings';
import type { ImportBatch } from '@/types/importBatch';
import type { ItemSource, ItemTopic } from '@/types/itemRelations';
import type { LearningItem } from '@/types/learningItem';
import { readingStatusFromRemote } from '@/utils/kanjiReading';
import type { Review } from '@/types/review';
import type { Source } from '@/types/source';
import type { StudySession } from '@/types/studySession';
import type { Topic } from '@/types/topic';
import type { UserProgress } from '@/types/userProgress';

type RemoteRow = Record<string, unknown>;

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

export function topicFromRemote(row: RemoteRow): Topic {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    level: row.level as Topic['level'],
    skill: row.skill as Topic['skill'],
    name: String(row.name),
    parentTopicId: optionalString(row.parent_topic_id),
    description: optionalString(row.description),
    sortOrder: optionalNumber(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: optionalString(row.deleted_at),
  };
}

export function topicToRemote(topic: Topic): RemoteRow {
  return {
    id: topic.id,
    user_id: topic.userId,
    level: topic.level,
    skill: topic.skill,
    name: topic.name,
    parent_topic_id: topic.parentTopicId ?? null,
    description: topic.description ?? null,
    sort_order: topic.sortOrder ?? null,
    created_at: topic.createdAt,
    updated_at: topic.updatedAt,
    deleted_at: topic.deletedAt ?? null,
  };
}

export function sourceFromRemote(row: RemoteRow): Source {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    label: String(row.label),
    type: row.type as Source['type'] | undefined,
    notes: optionalString(row.notes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function sourceToRemote(source: Source): RemoteRow {
  return {
    id: source.id,
    user_id: source.userId,
    label: source.label,
    type: source.type ?? null,
    notes: source.notes ?? null,
    created_at: source.createdAt,
    updated_at: source.updatedAt,
  };
}

export function learningItemFromRemote(row: RemoteRow): LearningItem {
  const onyomi = optionalString(row.onyomi);
  const kunyomi = optionalString(row.kunyomi);

  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type as LearningItem['type'],
    level: row.level as LearningItem['level'],
    skill: row.skill as LearningItem['skill'],
    japanese: String(row.japanese),
    reading: optionalString(row.reading),
    meaning: String(row.meaning),
    meaningAlt: optionalString(row.meaning_alt),
    example: optionalString(row.example),
    exampleReading: optionalString(row.example_reading),
    notes: optionalString(row.notes),
    onyomi,
    onyomiStatus: readingStatusFromRemote(row.onyomi_status, onyomi),
    kunyomi,
    kunyomiStatus: readingStatusFromRemote(row.kunyomi_status, kunyomi),
    passageText: optionalString(row.passage_text),
    audioStoragePath: optionalString(row.audio_storage_path),
    audioUrl: optionalString(row.audio_url),
    audioMimeType: optionalString(row.audio_mime_type),
    questions: row.questions as LearningItem['questions'],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    isCustom: Boolean(row.is_custom),
    importBatchId: optionalString(row.import_batch_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: optionalString(row.deleted_at),
  };
}

export function learningItemToRemote(item: LearningItem): RemoteRow {
  return {
    id: item.id,
    user_id: item.userId,
    type: item.type,
    level: item.level,
    skill: item.skill,
    japanese: item.japanese,
    reading: item.reading ?? null,
    meaning: item.meaning,
    meaning_alt: item.meaningAlt ?? null,
    example: item.example ?? null,
    example_reading: item.exampleReading ?? null,
    notes: item.notes ?? null,
    onyomi: item.onyomi ?? null,
    onyomi_status: item.onyomiStatus ?? 'unset',
    kunyomi: item.kunyomi ?? null,
    kunyomi_status: item.kunyomiStatus ?? 'unset',
    passage_text: item.passageText ?? null,
    audio_storage_path: item.audioStoragePath ?? null,
    audio_url: item.audioUrl ?? null,
    audio_mime_type: item.audioMimeType ?? null,
    questions: item.questions ?? null,
    tags: item.tags,
    is_custom: item.isCustom,
    import_batch_id: item.importBatchId ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: item.deletedAt ?? null,
  };
}

export function itemSourceFromRemote(row: RemoteRow): ItemSource {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    itemId: String(row.item_id),
    sourceId: String(row.source_id),
    reference: optionalString(row.reference),
    notes: optionalString(row.notes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function itemSourceToRemote(link: ItemSource): RemoteRow {
  return {
    id: link.id,
    user_id: link.userId,
    item_id: link.itemId,
    source_id: link.sourceId,
    reference: link.reference ?? null,
    notes: link.notes ?? null,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  };
}

export function itemTopicFromRemote(row: RemoteRow): ItemTopic {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    itemId: String(row.item_id),
    topicId: String(row.topic_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function itemTopicToRemote(link: ItemTopic): RemoteRow {
  return {
    id: link.id,
    user_id: link.userId,
    item_id: link.itemId,
    topic_id: link.topicId,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  };
}

export function reviewFromRemote(row: RemoteRow): Review {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    itemId: String(row.item_id),
    grade: row.grade as Review['grade'],
    responseTimeMs: optionalNumber(row.response_time_ms),
    reviewedAt: String(row.reviewed_at),
    deviceId: optionalString(row.device_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function reviewToRemote(review: Review): RemoteRow {
  return {
    id: review.id,
    user_id: review.userId,
    item_id: review.itemId,
    grade: review.grade,
    response_time_ms: review.responseTimeMs ?? null,
    reviewed_at: review.reviewedAt,
    device_id: review.deviceId ?? null,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
  };
}

export function userProgressFromRemote(row: RemoteRow): UserProgress {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    itemId: String(row.item_id),
    intervalDays: Number(row.interval_days),
    easeFactor: Number(row.ease_factor),
    repetitions: Number(row.repetitions),
    nextReviewAt: String(row.next_review_at),
    lastReviewAt: optionalString(row.last_review_at),
    masteryLevel: row.mastery_level as UserProgress['masteryLevel'],
    accuracyRecent: optionalNumber(row.accuracy_recent),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function userProgressToRemote(progress: UserProgress): RemoteRow {
  return {
    id: progress.id,
    user_id: progress.userId,
    item_id: progress.itemId,
    interval_days: progress.intervalDays,
    ease_factor: progress.easeFactor,
    repetitions: progress.repetitions,
    next_review_at: progress.nextReviewAt,
    last_review_at: progress.lastReviewAt ?? null,
    mastery_level: progress.masteryLevel,
    accuracy_recent: progress.accuracyRecent ?? null,
    created_at: progress.createdAt,
    updated_at: progress.updatedAt,
  };
}

export function studySessionFromRemote(row: RemoteRow): StudySession {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    startedAt: String(row.started_at),
    endedAt: optionalString(row.ended_at),
    durationMinutes: optionalNumber(row.duration_minutes),
    skills: Array.isArray(row.skills) ? (row.skills as StudySession['skills']) : [],
    topicIds: Array.isArray(row.topic_ids) ? row.topic_ids.map(String) : [],
    itemsReviewed: Number(row.items_reviewed),
    accuracy: optionalNumber(row.accuracy),
    notes: optionalString(row.notes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function studySessionToRemote(session: StudySession): RemoteRow {
  return {
    id: session.id,
    user_id: session.userId,
    started_at: session.startedAt,
    ended_at: session.endedAt ?? null,
    duration_minutes: session.durationMinutes ?? null,
    skills: session.skills,
    topic_ids: session.topicIds,
    items_reviewed: session.itemsReviewed,
    accuracy: session.accuracy ?? null,
    notes: session.notes ?? null,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
}

export function importBatchFromRemote(row: RemoteRow): ImportBatch {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    filename: optionalString(row.filename),
    importedAt: String(row.imported_at),
    itemCount: Number(row.item_count),
    skippedCount: Number(row.skipped_count),
    errorCount: Number(row.error_count),
    errors: row.errors as ImportBatch['errors'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function importBatchToRemote(batch: ImportBatch): RemoteRow {
  return {
    id: batch.id,
    user_id: batch.userId,
    filename: batch.filename ?? null,
    imported_at: batch.importedAt,
    item_count: batch.itemCount,
    skipped_count: batch.skippedCount,
    error_count: batch.errorCount,
    errors: batch.errors ?? null,
    created_at: batch.createdAt,
    updated_at: batch.updatedAt,
  };
}

export function appSettingsFromRemote(row: RemoteRow): AppSettings {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    examDate: String(row.exam_date),
    dailyGoalMinutes: Number(row.daily_goal_minutes),
    n5RecapRatio: Number(row.n5_recap_ratio),
    locale: String(row.locale),
    theme: row.theme as AppSettings['theme'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function appSettingsToRemote(settings: AppSettings): RemoteRow {
  return {
    id: settings.id,
    user_id: settings.userId,
    exam_date: settings.examDate,
    daily_goal_minutes: settings.dailyGoalMinutes,
    n5_recap_ratio: settings.n5RecapRatio,
    locale: settings.locale,
    theme: settings.theme,
    created_at: settings.createdAt,
    updated_at: settings.updatedAt,
  };
}
