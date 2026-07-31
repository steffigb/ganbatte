import type { ImportPreviewRow } from '@/lib/import/types';
import { cn } from '@/utils/cn';
import { formatItemMeaning } from '@/utils/meaningText';

type ImportPreviewTableProps = {
  rows: ImportPreviewRow[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    duplicate: number;
  };
};

function statusLabel(row: ImportPreviewRow): string {
  if (row.status === 'invalid') {
    return 'Invalid';
  }

  if (row.status === 'duplicate') {
    if (row.duplicateInFile && row.duplicateItemId) {
      return 'Duplicate (file + existing)';
    }
    if (row.duplicateInFile) {
      return 'Duplicate in file';
    }
    return 'Duplicate (existing)';
  }

  return 'New';
}

function statusClass(row: ImportPreviewRow): string {
  if (row.status === 'invalid') {
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
  }

  if (row.status === 'duplicate') {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200';
  }

  return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
}

export function ImportPreviewTable({ rows, stats }: ImportPreviewTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span>{stats.total} rows</span>
        <span>{stats.valid} new items</span>
        <span>{stats.duplicate} skipped</span>
        <span>{stats.invalid} invalid</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Row</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Japanese</th>
              <th className="px-3 py-2 font-medium">Meaning</th>
              <th className="px-3 py-2 font-medium">Example</th>
              <th className="px-3 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.rowNumber}
                className="border-t border-slate-200 dark:border-slate-700"
              >
                <td className="px-3 py-2 align-top">{row.rowNumber}</td>
                <td className="px-3 py-2 align-top">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      statusClass(row),
                    )}
                  >
                    {statusLabel(row)}
                  </span>
                </td>
                <td className="px-3 py-2 align-top">{row.data?.type ?? '—'}</td>
                <td className="px-3 py-2 align-top font-medium">{row.data?.japanese ?? '—'}</td>
                <td className="px-3 py-2 align-top">
                  {row.data ? formatItemMeaning(row.data.meaning, row.data.meaningAlt) : '—'}
                </td>
                <td className="px-3 py-2 align-top">
                  {row.data?.example ?? '—'}
                  {row.data?.exampleMeaning ? (
                    <span className="block text-slate-500 dark:text-slate-400">
                      {row.data.exampleMeaning}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 align-top text-slate-600 dark:text-slate-400">
                  {row.errors.length > 0 ? row.errors.join('; ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
