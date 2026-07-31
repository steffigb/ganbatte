import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { SearchFilters } from '@/features/search/searchService';

type SearchFiltersPanelProps = {
  filters: SearchFilters;
  onFilterChange: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => void;
  onReset: () => void;
};

export function SearchFiltersPanel({
  filters,
  onFilterChange,
  onReset,
}: SearchFiltersPanelProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Select
        id="search-type"
        label="Type"
        value={filters.type}
        onChange={(event) =>
          onFilterChange('type', event.target.value as SearchFilters['type'])
        }
        options={[
          { value: 'all', label: 'All types' },
          { value: 'expression', label: 'Vocabulary' },
          { value: 'kanji', label: 'Kanji' },
          { value: 'grammar', label: 'Grammar' },
          { value: 'reading', label: 'Reading' },
          { value: 'listening', label: 'Listening' },
        ]}
      />

      <Select
        id="search-level"
        label="Level"
        value={filters.level}
        onChange={(event) =>
          onFilterChange('level', event.target.value as SearchFilters['level'])
        }
        options={[
          { value: 'all', label: 'All levels' },
          { value: 'N4', label: 'N4' },
          { value: 'N5', label: 'N5' },
        ]}
      />

      <Select
        id="search-skill"
        label="Skill"
        value={filters.skill}
        onChange={(event) =>
          onFilterChange('skill', event.target.value as SearchFilters['skill'])
        }
        options={[
          { value: 'all', label: 'All skills' },
          { value: 'vocabulary', label: 'Vocabulary' },
          { value: 'kanji', label: 'Kanji' },
          { value: 'grammar', label: 'Grammar' },
          { value: 'reading', label: 'Reading' },
          { value: 'listening', label: 'Listening' },
        ]}
      />

      <Select
        id="search-mastery"
        label="Mastery"
        value={filters.mastery}
        onChange={(event) =>
          onFilterChange('mastery', event.target.value as SearchFilters['mastery'])
        }
        options={[
          { value: 'all', label: 'All mastery' },
          { value: 'new', label: 'New' },
          { value: 'learning', label: 'Learning' },
          { value: 'familiar', label: 'Familiar' },
          { value: 'mastered', label: 'Mastered' },
        ]}
      />

      <div className="flex flex-col justify-end gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.weakOnly}
            onChange={(event) => onFilterChange('weakOnly', event.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          Weak only
        </label>
        <Button type="button" className="w-full bg-slate-700 hover:bg-slate-800" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
