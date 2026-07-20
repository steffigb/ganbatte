import { buildColumnMap } from '@/lib/import/columnMap';
import { exampleMatchKey, hasImportExample } from '@/lib/import/exampleHelpers';
import { itemDuplicateKey, parseImportRow } from '@/lib/import/parseRow';
import { parseCsv } from '@/lib/import/parseCsv';
import type { ImportPreview, ImportPreviewRow, PreviewRowStatus } from '@/lib/import/types';
import { findItemByJapanese } from '@/lib/db';

function classifyRow(
  hasExample: boolean,
  itemExists: boolean,
  itemSeenInFile: boolean,
  exampleSeenInFile: boolean,
): PreviewRowStatus {
  if (hasExample) {
    if (exampleSeenInFile) {
      return 'duplicate';
    }

    if (itemExists || itemSeenInFile) {
      return 'example';
    }

    return 'valid';
  }

  if (itemExists || itemSeenInFile) {
    return 'duplicate';
  }

  return 'valid';
}

export async function buildImportPreview(
  userId: string,
  csvText: string,
): Promise<ImportPreview> {
  const { headers, rows } = parseCsv(csvText);
  const columnMap = buildColumnMap(headers);
  const previewRows: ImportPreviewRow[] = [];
  const seenItemsInFile = new Set<string>();
  const seenExamplesInFile = new Map<string, Set<string>>();

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    const raw = rows[index];
    const parsed = parseImportRow(rowNumber, raw, columnMap);

    if (!parsed.ok) {
      previewRows.push({
        rowNumber,
        status: 'invalid',
        errors: parsed.errors,
        raw,
      });
      continue;
    }

    const itemKey = itemDuplicateKey(parsed.data.type, parsed.data.japanese);
    const hasExample = hasImportExample(parsed.data);
    const exampleKey = hasExample ? exampleMatchKey(parsed.data) : undefined;
    const exampleSet = seenExamplesInFile.get(itemKey) ?? new Set<string>();
    const existing = await findItemByJapanese(userId, parsed.data.type, parsed.data.japanese);
    const itemSeenInFile = seenItemsInFile.has(itemKey);
    const exampleSeenInFile = exampleKey ? exampleSet.has(exampleKey) : false;

    const status = classifyRow(
      hasExample,
      Boolean(existing),
      itemSeenInFile,
      exampleSeenInFile,
    );

    if (status === 'valid') {
      seenItemsInFile.add(itemKey);
    }

    if (exampleKey && status !== 'duplicate') {
      exampleSet.add(exampleKey);
      seenExamplesInFile.set(itemKey, exampleSet);
    }

    previewRows.push({
      rowNumber,
      status,
      errors: [],
      duplicateItemId: existing?.id,
      duplicateInFile: itemSeenInFile || exampleSeenInFile,
      data: parsed.data,
      raw,
    });
  }

  const valid = previewRows.filter((row) => row.status === 'valid').length;
  const examples = previewRows.filter((row) => row.status === 'example').length;
  const invalid = previewRows.filter((row) => row.status === 'invalid').length;
  const duplicate = previewRows.filter((row) => row.status === 'duplicate').length;

  return {
    headers,
    columnMap,
    rows: previewRows,
    stats: {
      total: previewRows.length,
      valid,
      examples,
      invalid,
      duplicate,
    },
  };
}
