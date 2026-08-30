import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { KanjiReadingFieldInput } from '@/utils/kanjiReading';

type KanjiReadingFieldProps = {
  id: string;
  label: string;
  noneLabel: string;
  placeholder?: string;
  field: KanjiReadingFieldInput;
  onChange: (field: KanjiReadingFieldInput) => void;
};

export function KanjiReadingField({
  id,
  label,
  noneLabel,
  placeholder,
  field,
  onChange,
}: KanjiReadingFieldProps) {
  function setValue(value: string) {
    onChange({
      value,
      status: value.trim() ? 'set' : 'unset',
      noneChecked: false,
    });
  }

  function setNoneChecked(noneChecked: boolean) {
    onChange(
      noneChecked
        ? { value: '', status: 'none', noneChecked: true }
        : { value: field.value, status: 'unset', noneChecked: false },
    );
  }

  const isUnset = field.status === 'unset' && !field.noneChecked && !field.value.trim();

  return (
    <div className="space-y-2">
      <Input
        id={id}
        label={label}
        value={field.value}
        placeholder={placeholder}
        disabled={field.noneChecked}
        onChange={(event) => setValue(event.target.value)}
        className={cn(isUnset && 'border-amber-300 dark:border-amber-700')}
      />
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={field.noneChecked}
          onChange={(event) => setNoneChecked(event.target.checked)}
          className="rounded border-slate-300"
        />
        {noneLabel}
      </label>
      {isUnset ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Not set yet — enter a reading or mark as none.
        </p>
      ) : null}
    </div>
  );
}
