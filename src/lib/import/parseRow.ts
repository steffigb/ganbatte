import { getCellValue } from '@/lib/import/columnMap';
import {
  parseItemType,
  parseLevel,
  parseMeaningFields,
  parseSkill,
  parseTags,
  parseTopicNames,
} from '@/lib/import/normalizeField';
import type { ImportFieldKey, ParsedImportRow } from '@/lib/import/types';
import { parseImportReadingCell } from '@/utils/kanjiReading';

export type ParseRowResult =
  | { ok: true; data: ParsedImportRow }
  | { ok: false; errors: string[] };

export function parseImportRow(
  rowNumber: number,
  raw: Record<string, string>,
  columnMap: Partial<Record<ImportFieldKey, string>>,
): ParseRowResult {
  const errors: string[] = [];

  const type = parseItemType(getCellValue(raw, columnMap, 'type'));
  if (!type) {
    errors.push('Invalid or missing type');
  }

  const level = parseLevel(getCellValue(raw, columnMap, 'level'));
  const skill = parseSkill(getCellValue(raw, columnMap, 'skill'), type);
  if (!skill) {
    errors.push('Could not determine skill');
  }

  const japanese = getCellValue(raw, columnMap, 'japanese');
  if (!japanese) {
    errors.push('Japanese text is required');
  }

  const meaningFields = parseMeaningFields(
    getCellValue(raw, columnMap, 'meaning'),
    getCellValue(raw, columnMap, 'german'),
  );
  if (meaningFields.error) {
    errors.push(meaningFields.error);
  }

  if (errors.length > 0 || !type || !skill || !japanese || !meaningFields.meaning) {
    return { ok: false, errors };
  }

  const base: ParsedImportRow = {
    rowNumber,
    type,
    level,
    skill,
    japanese,
    meaning: meaningFields.meaning,
    meaningAlt: meaningFields.meaningAlt,
    example: getCellValue(raw, columnMap, 'example'),
    exampleReading: getCellValue(raw, columnMap, 'example_reading'),
    notes: getCellValue(raw, columnMap, 'notes'),
    topicNames: parseTopicNames(getCellValue(raw, columnMap, 'topics')),
    tags: parseTags(getCellValue(raw, columnMap, 'tags')),
    sourceLabel: getCellValue(raw, columnMap, 'source'),
    sourceRef: getCellValue(raw, columnMap, 'source_ref'),
  };

  if (type === 'kanji') {
    const onyomi = parseImportReadingCell(getCellValue(raw, columnMap, 'onyomi'));
    const kunyomi = parseImportReadingCell(getCellValue(raw, columnMap, 'kunyomi'));

    return {
      ok: true,
      data: {
        ...base,
        onyomi: onyomi.value,
        onyomiStatus: onyomi.status,
        kunyomi: kunyomi.value,
        kunyomiStatus: kunyomi.status,
      },
    };
  }

  return {
    ok: true,
    data: {
      ...base,
      reading: getCellValue(raw, columnMap, 'reading'),
    },
  };
}

export function itemDuplicateKey(type: ParsedImportRow['type'], japanese: string): string {
  return `${type}:${japanese}`;
}
