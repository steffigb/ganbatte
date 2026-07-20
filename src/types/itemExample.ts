import type { SoftDeletable, Timestamps, UserOwned } from '@/types/common';

export interface ItemExample extends Timestamps, SoftDeletable, UserOwned {
  id: string;
  itemId: string;
  example: string;
  exampleReading?: string;
  exampleMeaning?: string;
  sortOrder: number;
}
