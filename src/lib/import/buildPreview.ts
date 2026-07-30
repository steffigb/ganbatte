import { buildColumnMap } from '@/lib/import/columnMap';
import { itemDuplicateKey, parseImportRow } from '@/lib/import/parseRow';
import { parseCsv } from '@/lib/import/parseCsv';
import type { ImportPreview, ImportPreviewRow, PreviewRowStatus } from '@/lib/import/types';
import { findItemByJapanese } from '@/lib/db';

function classifyRow(itemExists: boolean, itemSeenInFile: boolean): PreviewRowStatus {
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
    const existing = await findItemByJapanese(userId, parsed.data.type, parsed.data.japanese);
    const itemSeenInFile = seenItemsInFile.has(itemKey);

    const status = classifyRow(Boolean(existing), itemSeenInFile);

    if (status === 'valid') {
      seenItemsInFile.add(itemKey);
    }

    previewRows.push({
      rowNumber,
      status,
      errors: [],
      duplicateItemId: existing?.id,
      duplicateInFile: itemSeenInFile,
      data: parsed.data,
      raw,
    });
  }

  const valid = previewRows.filter((row) => row.status === 'valid').length;
  const invalid = previewRows.filter((row) => row.status === 'invalid').length;
  const duplicate = previewRows.filter((row) => row.status === 'duplicate').length;

  return {
    headers,
    columnMap,
    rows: previewRows,
    stats: {
      total: previewRows.length,
      valid,
      invalid,
      duplicate,
    },
  };
}
