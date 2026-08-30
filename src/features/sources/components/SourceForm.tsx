import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { CreateSourceInput } from '@/features/sources/hooks/useSources';
import type { SourceType } from '@/types/source';

const typeOptions = [
  { value: '', label: 'No type' },
  { value: 'book', label: 'Book' },
  { value: 'deck', label: 'Deck' },
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'list', label: 'List' },
  { value: 'other', label: 'Other' },
];

type SourceFormProps = {
  onSubmit: (input: CreateSourceInput) => Promise<void>;
};

export function SourceForm({ onSubmit }: SourceFormProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<SourceType | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        label,
        type: type || undefined,
      });
      setLabel('');
      setType('');
      setSuccess('Source added successfully.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save source');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">New source</h2>
      <Input
        id="source-label"
        label="Label"
        required
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="e.g. Try! N4, Genki II, Anki"
      />
      <Select
        id="source-type"
        label="Type (optional)"
        value={type}
        options={typeOptions}
        onChange={(event) => setType(event.target.value as SourceType | '')}
      />
      {error ? <FormAlert variant="error" message={error} /> : null}
      {success ? <FormAlert variant="success" message={success} /> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Add source'}
      </Button>
    </form>
  );
}
