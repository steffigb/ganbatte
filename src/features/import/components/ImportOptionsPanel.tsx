import { Select } from '@/components/ui/Select';
import type { DuplicateAction, ImportOptions } from '@/lib/import/types';

type ImportOptionsPanelProps = {
  options: ImportOptions;
  onChange: (options: ImportOptions) => void;
};

const duplicateOptions = [
  { value: 'attach_source', label: 'Attach source / topics (default)' },
  { value: 'skip', label: 'Skip duplicates' },
  { value: 'update', label: 'Update existing item fields' },
];

export function ImportOptionsPanel({ options, onChange }: ImportOptionsPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Import options</h3>

      <Select
        id="import-duplicate-action"
        label="When item already exists (same type + Japanese)"
        value={options.duplicateAction}
        options={duplicateOptions}
        onChange={(event) =>
          onChange({
            ...options,
            duplicateAction: event.target.value as DuplicateAction,
          })
        }
      />

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={options.createTopics}
          onChange={(event) =>
            onChange({
              ...options,
              createTopics: event.target.checked,
            })
          }
        />
        Create missing topics from CSV
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={options.createSources}
          onChange={(event) =>
            onChange({
              ...options,
              createSources: event.target.checked,
            })
          }
        />
        Create missing sources from CSV
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={options.replaceSource}
          onChange={(event) =>
            onChange({
              ...options,
              replaceSource: event.target.checked,
            })
          }
        />
        Replace existing source instead of adding to it
      </label>
    </div>
  );
}
