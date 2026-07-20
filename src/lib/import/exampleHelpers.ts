import type { ParsedImportRow } from '@/lib/import/types';

export function hasImportExample(row: Pick<ParsedImportRow, 'example'>): boolean {
  return Boolean(row.example?.trim());
}

export function exampleMatchKey(
  row: Pick<ParsedImportRow, 'example' | 'exampleReading'>,
): string {
  return [row.example?.trim() ?? '', row.exampleReading?.trim() ?? ''].join('|');
}

export function exampleContentKey(
  row: Pick<ParsedImportRow, 'example' | 'exampleReading' | 'exampleMeaning'>,
): string {
  return [row.example?.trim() ?? '', row.exampleReading?.trim() ?? '', row.exampleMeaning?.trim() ?? ''].join(
    '|',
  );
}

export function shouldStoreExamplesOnItem(type: ParsedImportRow['type']): boolean {
  return type !== 'kanji';
}
