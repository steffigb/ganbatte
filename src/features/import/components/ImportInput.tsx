import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

type ImportInputProps = {
  csvText: string;
  filename?: string;
  isLoading: boolean;
  onCsvTextChange: (value: string) => void;
  onFileLoaded: (text: string, filename: string) => void;
  onPreview: () => void;
};

export function ImportInput({
  csvText,
  filename,
  isLoading,
  onCsvTextChange,
  onFileLoaded,
  onPreview,
}: ImportInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300">
        <p className="font-medium text-green-900 dark:text-green-100">CSV format</p>
        <p className="mt-1">
          Multiple meanings in one cell: use <code className="text-xs"> · </code> (mediopunkt).
          Import also accepts <code className="text-xs">/</code> or <code className="text-xs">;</code> and
          stores them as mediopunkt.
        </p>
        <p className="mt-1">
          Use the templates in <code className="text-xs">templates/import/</code>. Required
          columns: <code className="text-xs">type</code>, <code className="text-xs">japanese</code>,{' '}
          <code className="text-xs">meaning</code>. Kanji reading cells: empty = not set,{' '}
          <code className="text-xs">-</code> = none, text = value.
        </p>
        <p className="mt-1">
          Multiple sources in one cell: separate with <code className="text-xs">;</code>, e.g.{' '}
          <code className="text-xs">Genki 1; Nihongo So-matome N5</code>. Give each one a
          reference the same way, in the same order, in{' '}
          <code className="text-xs">source_ref</code>: <code className="text-xs">chapter 3; lesson 4</code>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            void file.text().then((text) => {
              onFileLoaded(text, file.name);
            });
          }}
        />
        <Button type="button" onClick={() => fileInputRef.current?.click()}>
          Choose CSV file
        </Button>
        {filename ? <span className="text-sm text-green-700 dark:text-green-400">{filename}</span> : null}
      </div>

      <Textarea
        id="import-csv-text"
        label="Or paste CSV text"
        value={csvText}
        onChange={(event) => onCsvTextChange(event.target.value)}
        className="min-h-48 font-mono text-xs"
        placeholder="type,level,skill,japanese,meaning"
      />

      <Button type="button" disabled={!csvText.trim() || isLoading} onClick={onPreview}>
        {isLoading ? 'Parsing…' : 'Preview import'}
      </Button>
    </div>
  );
}
