import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { CreateTopicInput } from '@/features/topics/hooks/useTopics';

const levelOptions = [
  { value: 'N4', label: 'N4' },
  { value: 'N5', label: 'N5' },
];

const skillOptions = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'kanji', label: 'Kanji' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
];

type TopicFormProps = {
  onSubmit: (input: CreateTopicInput) => Promise<void>;
};

export function TopicForm({ onSubmit }: TopicFormProps) {
  const [level, setLevel] = useState<CreateTopicInput['level']>('N4');
  const [skill, setSkill] = useState<CreateTopicInput['skill']>('vocabulary');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
        level,
        skill,
        name,
        description: description || undefined,
      });
      setName('');
      setDescription('');
      setSuccess('Topic added successfully.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save topic');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">New topic</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="topic-level"
          label="Level"
          value={level}
          options={levelOptions}
          onChange={(event) => setLevel(event.target.value as CreateTopicInput['level'])}
        />
        <Select
          id="topic-skill"
          label="Skill"
          value={skill}
          options={skillOptions}
          onChange={(event) => setSkill(event.target.value as CreateTopicInput['skill'])}
        />
      </div>
      <Input
        id="topic-name"
        label="Name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Te-Form, Transport"
      />
      <Textarea
        id="topic-description"
        label="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error ? <FormAlert variant="error" message={error} /> : null}
      {success ? <FormAlert variant="success" message={success} /> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Add topic'}
      </Button>
    </form>
  );
}
