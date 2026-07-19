export interface TopicProgress {
  topicId: string;
  itemCount: number;
  masteredCount: number;
  masteryPercent: number;
  needsAttention: boolean;
  lastStudiedAt?: string;
  updatedAt: string;
}
