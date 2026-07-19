import type { Timestamps, UserOwned } from '@/types/common';

export type SourceType =
  | 'book'
  | 'deck'
  | 'video'
  | 'podcast'
  | 'list'
  | 'other';

export interface Source extends Timestamps, UserOwned {
  id: string;
  label: string;
  type?: SourceType;
  notes?: string;
}
