import type { ImportError } from '@/types/importBatch';
import type {
  ItemType,
  JlptLevel,
  PartOfSpeech,
  ReadingStatus,
  Skill,
  Transitivity,
  VerbType,
} from '@/types/domain';

export type ImportFieldKey =
  | 'type'
  | 'level'
  | 'skill'
  | 'topics'
  | 'japanese'
  | 'reading'
  | 'onyomi'
  | 'kunyomi'
  | 'meaning'
  | 'german'
  | 'example'
  | 'example_reading'
  | 'example_meaning'
  | 'part_of_speech'
  | 'verb_type'
  | 'transitivity'
  | 'paired_with'
  | 'source'
  | 'source_ref'
  | 'tags'
  | 'notes';

export type DuplicateAction = 'attach_source' | 'skip' | 'update';

export type ImportOptions = {
  duplicateAction: DuplicateAction;
  createTopics: boolean;
  createSources: boolean;
};

export const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
  duplicateAction: 'attach_source',
  createTopics: true,
  createSources: true,
};

export type ParsedImportRow = {
  rowNumber: number;
  type: ItemType;
  level: JlptLevel;
  skill: Skill;
  japanese: string;
  meaning: string;
  meaningAlt?: string;
  reading?: string;
  onyomi?: string;
  onyomiStatus?: ReadingStatus;
  kunyomi?: string;
  kunyomiStatus?: ReadingStatus;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: string;
  notes?: string;
  partOfSpeech?: PartOfSpeech;
  verbType?: VerbType;
  transitivity?: Transitivity;
  pairedWithJapanese?: string;
  topicNames: string[];
  tags: string[];
  sourceLabel?: string;
  sourceRef?: string;
};

export type PreviewRowStatus = 'valid' | 'invalid' | 'duplicate';

export type ImportPreviewRow = {
  rowNumber: number;
  status: PreviewRowStatus;
  errors: string[];
  duplicateItemId?: string;
  duplicateInFile?: boolean;
  data?: ParsedImportRow;
  raw: Record<string, string>;
};

export type ImportPreview = {
  headers: string[];
  columnMap: Partial<Record<ImportFieldKey, string>>;
  rows: ImportPreviewRow[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    duplicate: number;
  };
};

export type ImportResult = {
  batchId: string;
  importedCount: number;
  attachedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportError[];
};
