import type { Timestamps, UserOwned } from '@/types/common';

export interface ItemSource extends Timestamps, UserOwned {
  id: string;
  itemId: string;
  sourceId: string;
  reference?: string;
  notes?: string;
}

export interface ItemTopic extends Timestamps, UserOwned {
  id: string;
  itemId: string;
  topicId: string;
}
