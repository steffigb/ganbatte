import type { Timestamps, UserOwned } from '@/types/common';

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportBatch extends Timestamps, UserOwned {
  id: string;
  filename?: string;
  importedAt: string;
  itemCount: number;
  skippedCount: number;
  errorCount: number;
  errors?: ImportError[];
}
