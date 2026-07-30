import type { ReadingStatus } from '@/types/domain';
import { readingToHiragana, readingToKatakana } from '@/utils/japaneseText';

export const READING_NONE_LABEL = '—';
export const READING_UNSET_LABEL = 'not set';

const NONE_PLACEHOLDERS = new Set(['-', '—', '–', '−', 'none', 'n/a', 'na']);

export function isReadingNonePlaceholder(value: string): boolean {
  return NONE_PLACEHOLDERS.has(value.trim().toLowerCase());
}

export function readingStatusFromRemote(
  status: unknown,
  value: string | undefined,
): ReadingStatus {
  if (status === 'unset' || status === 'none' || status === 'set') {
    return status;
  }

  if (value) {
    return 'set';
  }

  return 'unset';
}

export function resolveReadingStatus(
  status: ReadingStatus | undefined,
  value: string | undefined,
): ReadingStatus {
  if (status) {
    return status;
  }

  return value ? 'set' : 'unset';
}

export function formatKanjiReadingDisplay(
  status: ReadingStatus | undefined,
  value: string | undefined,
  formatValue: (text: string) => string,
): string {
  const resolved = resolveReadingStatus(status, value);

  if (resolved === 'none') {
    return READING_NONE_LABEL;
  }

  if (resolved === 'unset') {
    return READING_UNSET_LABEL;
  }

  return value ? formatValue(value) : READING_UNSET_LABEL;
}

export function isReadingUnset(status: ReadingStatus | undefined, value?: string): boolean {
  return resolveReadingStatus(status, value) === 'unset';
}

export function formatOnyomiDisplay(
  status: ReadingStatus | undefined,
  value: string | undefined,
): string {
  return formatKanjiReadingDisplay(status, value, readingToKatakana);
}

export function formatKunyomiDisplay(
  status: ReadingStatus | undefined,
  value: string | undefined,
): string {
  return formatKanjiReadingDisplay(status, value, readingToHiragana);
}

export type KanjiReadingFieldInput = {
  value: string;
  status: ReadingStatus;
  noneChecked: boolean;
};

export function kanjiReadingFieldFromItem(
  value: string | undefined,
  status: ReadingStatus | undefined,
): KanjiReadingFieldInput {
  const resolved = resolveReadingStatus(status, value);

  if (resolved === 'none') {
    return { value: '', status: 'none', noneChecked: true };
  }

  if (resolved === 'set') {
    return { value: value ?? '', status: 'set', noneChecked: false };
  }

  return { value: '', status: 'unset', noneChecked: false };
}

export function kanjiReadingFieldToStored(field: KanjiReadingFieldInput): {
  value?: string;
  status: ReadingStatus;
} {
  if (field.noneChecked || field.status === 'none') {
    return { value: undefined, status: 'none' };
  }

  const trimmed = field.value.trim();
  if (trimmed) {
    return { value: trimmed, status: 'set' };
  }

  return { value: undefined, status: 'unset' };
}

export function validateKanjiReadingField(
  label: string,
  status: ReadingStatus,
  value?: string,
): void {
  const trimmed = value?.trim() ?? '';

  if (status === 'set' && !trimmed) {
    throw new Error(`${label}: enter a reading or mark it as none.`);
  }

  if (status === 'none' && trimmed) {
    throw new Error(`${label}: clear the field when marked as none.`);
  }
}

export function validateKanjiReadingFields(fields: {
  onyomi?: string;
  onyomiStatus: ReadingStatus;
  kunyomi?: string;
  kunyomiStatus: ReadingStatus;
}): void {
  validateKanjiReadingField("On'yomi", fields.onyomiStatus, fields.onyomi);
  validateKanjiReadingField("Kun'yomi", fields.kunyomiStatus, fields.kunyomi);
}

export function parseImportReadingCell(value: string | undefined): {
  value?: string;
  status: ReadingStatus;
} {
  if (!value?.trim()) {
    return { status: 'unset' };
  }

  if (isReadingNonePlaceholder(value)) {
    return { status: 'none' };
  }

  return { value: value.trim(), status: 'set' };
}
