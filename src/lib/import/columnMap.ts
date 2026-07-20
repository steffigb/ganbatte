import type { ImportFieldKey } from '@/lib/import/types';

const HEADER_ALIASES: Record<string, ImportFieldKey> = {
  type: 'type',
  level: 'level',
  skill: 'skill',
  topics: 'topics',
  topic: 'topics',
  japanese: 'japanese',
  kanji: 'japanese',
  word: 'japanese',
  reading: 'reading',
  onyomi: 'onyomi',
  kunyomi: 'kunyomi',
  meaning: 'meaning',
  english: 'meaning',
  german: 'german',
  de: 'german',
  example: 'example',
  example_reading: 'example_reading',
  examplereading: 'example_reading',
  example_meaning: 'example_meaning',
  examplemeaning: 'example_meaning',
  source: 'source',
  source_ref: 'source_ref',
  sourceref: 'source_ref',
  source_reference: 'source_ref',
  tags: 'tags',
  tag: 'tags',
  notes: 'notes',
  note: 'notes',
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

export function buildColumnMap(headers: string[]): Partial<Record<ImportFieldKey, string>> {
  const map: Partial<Record<ImportFieldKey, string>> = {};

  for (const header of headers) {
    const field = HEADER_ALIASES[normalizeHeader(header)];
    if (field && !map[field]) {
      map[field] = header;
    }
  }

  return map;
}

export function getCellValue(
  row: Record<string, string>,
  columnMap: Partial<Record<ImportFieldKey, string>>,
  field: ImportFieldKey,
): string | undefined {
  const header = columnMap[field];
  if (!header) {
    return undefined;
  }

  const value = row[header]?.trim();
  return value || undefined;
}
