import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/app/routes.config';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { ItemFormValues } from '@/features/items/itemFormTypes';
import { createBlankKanjiReadingFields } from '@/features/items/itemFormTypes';
import type { SaveFeedback } from '@/features/items/hooks/useItemForm';
import { KanjiReadingField } from '@/features/items/components/KanjiReadingField';
import { useSources } from '@/features/sources';
import { useTopics } from '@/features/topics';
import type {
  ItemType,
  JlptLevel,
  PartOfSpeech,
  Transitivity,
  VerbType,
} from '@/types/domain';
import type { KanjiReadingFieldInput } from '@/utils/kanjiReading';

const typeOptions = [
  { value: 'expression', label: 'Expression (vocabulary)' },
  { value: 'kanji', label: 'Kanji' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
];

const levelOptions = [
  { value: 'N4', label: 'N4' },
  { value: 'N5', label: 'N5' },
];

const partOfSpeechOptions = [
  { value: '', label: 'Not set' },
  { value: 'noun', label: 'Noun' },
  { value: 'pronoun', label: 'Pronoun' },
  { value: 'verb', label: 'Verb' },
  { value: 'i-adjective', label: 'い-adjective' },
  { value: 'na-adjective', label: 'な-adjective' },
  { value: 'adverb', label: 'Adverb' },
  { value: 'particle', label: 'Particle' },
  { value: 'conjunction', label: 'Conjunction' },
  { value: 'interjection', label: 'Interjection' },
  { value: 'counter', label: 'Counter' },
  { value: 'prefix', label: 'Prefix' },
  { value: 'suffix', label: 'Suffix' },
  { value: 'determiner', label: 'Determiner' },
  { value: 'phrase', label: 'Phrase / set expression' },
  { value: 'other', label: 'Other' },
];

const verbTypeOptions = [
  { value: '', label: 'Not set' },
  { value: 'godan', label: 'Godan (五段)' },
  { value: 'ichidan', label: 'Ichidan (一段)' },
  { value: 'irregular', label: 'Irregular (する/来る)' },
];

const transitivityOptions = [
  { value: '', label: 'Not set' },
  { value: 'transitive', label: 'Transitive (他動詞)' },
  { value: 'intransitive', label: 'Intransitive (自動詞)' },
  { value: 'both', label: 'Both' },
];

type ItemFormFieldsProps = {
  initialValues: ItemFormValues;
  editId?: string;
  onSave: (values: ItemFormValues) => Promise<void>;
  isEditing: boolean;
  isSaving: boolean;
};

function ItemFormFields({
  initialValues,
  editId,
  onSave,
  isEditing,
  isSaving,
}: ItemFormFieldsProps) {
  const { topics } = useTopics();
  const { sources } = useSources();
  const [type, setType] = useState<ItemType>(initialValues.type);
  const [level, setLevel] = useState<JlptLevel>(initialValues.level);
  const [japanese, setJapanese] = useState(initialValues.japanese);
  const [reading, setReading] = useState(initialValues.reading ?? '');
  const [meaning, setMeaning] = useState(initialValues.meaning);
  const [notes, setNotes] = useState(initialValues.notes ?? '');
  const [topicIds, setTopicIds] = useState<string[]>(initialValues.topicIds);
  const [sourceIds, setSourceIds] = useState<string[]>(initialValues.sourceIds);
  const [sourceReferences, setSourceReferences] = useState<Record<string, string>>(
    initialValues.sourceReferences,
  );
  const [onyomiField, setOnyomiField] = useState<KanjiReadingFieldInput>(
    initialValues.onyomi ?? createBlankKanjiReadingFields().onyomi!,
  );
  const [kunyomiField, setKunyomiField] = useState<KanjiReadingFieldInput>(
    initialValues.kunyomi ?? createBlankKanjiReadingFields().kunyomi!,
  );
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech | ''>(
    initialValues.partOfSpeech ?? '',
  );
  const [verbType, setVerbType] = useState<VerbType | ''>(initialValues.verbType ?? '');
  const [transitivity, setTransitivity] = useState<Transitivity | ''>(
    initialValues.transitivity ?? '',
  );
  const [pairedWithJapanese, setPairedWithJapanese] = useState(
    initialValues.pairedWithJapanese ?? '',
  );

  function handleTypeChange(nextType: ItemType) {
    if (nextType === 'kanji' && type !== 'kanji') {
      const blanks = createBlankKanjiReadingFields();
      setOnyomiField(blanks.onyomi!);
      setKunyomiField(blanks.kunyomi!);
    }
    setType(nextType);
  }

  function handlePartOfSpeechChange(next: PartOfSpeech | '') {
    if (next !== 'verb') {
      setVerbType('');
      setTransitivity('');
      setPairedWithJapanese('');
    }
    setPartOfSpeech(next);
  }

  function toggleTopic(topicId: string) {
    setTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  }

  function toggleSource(sourceId: string) {
    setSourceIds((current) => {
      const isSelected = current.includes(sourceId);
      if (isSelected) {
        setSourceReferences((references) => {
          const next = { ...references };
          delete next[sourceId];
          return next;
        });
        return current.filter((id) => id !== sourceId);
      }
      return [...current, sourceId];
    });
  }

  function setSourceReference(sourceId: string, reference: string) {
    setSourceReferences((current) => ({
      ...current,
      [sourceId]: reference,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSave({
      id: editId,
      type,
      level,
      japanese,
      reading: type === 'kanji' ? undefined : reading || undefined,
      meaning,
      notes: notes || undefined,
      topicIds,
      sourceIds,
      sourceReferences,
      ...(type === 'kanji'
        ? {
            onyomi: onyomiField,
            kunyomi: kunyomiField,
          }
        : {}),
      ...(type === 'expression'
        ? {
            partOfSpeech: partOfSpeech || undefined,
            verbType: verbType || undefined,
            transitivity: transitivity || undefined,
            pairedWithJapanese: pairedWithJapanese.trim() || undefined,
          }
        : {}),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="item-type"
          label="Type"
          value={type}
          options={typeOptions}
          onChange={(event) => handleTypeChange(event.target.value as ItemType)}
        />
        <Select
          id="item-level"
          label="Level"
          value={level}
          options={levelOptions}
          onChange={(event) => setLevel(event.target.value as JlptLevel)}
        />
      </div>
      <Input
        id="item-japanese"
        label={type === 'kanji' ? 'Kanji' : 'Japanese'}
        required
        value={japanese}
        onChange={(event) => setJapanese(event.target.value)}
      />
      {type === 'kanji' ? (
        <div className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Readings</p>
          <KanjiReadingField
            id="kanji-onyomi"
            label="On'yomi"
            noneLabel="No on'yomi"
            placeholder="e.g. ウ、ユウ"
            field={onyomiField}
            onChange={setOnyomiField}
          />
          <KanjiReadingField
            id="kanji-kunyomi"
            label="Kun'yomi"
            noneLabel="No kun'yomi"
            placeholder="e.g. みぎ"
            field={kunyomiField}
            onChange={setKunyomiField}
          />
        </div>
      ) : (
        <Input
          id="item-reading"
          label="Reading (optional)"
          value={reading}
          onChange={(event) => setReading(event.target.value)}
        />
      )}
      {type === 'expression' ? (
        <div className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Word class (optional)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="item-part-of-speech"
              label="Part of speech"
              value={partOfSpeech}
              options={partOfSpeechOptions}
              onChange={(event) =>
                handlePartOfSpeechChange(event.target.value as PartOfSpeech | '')
              }
            />
            {partOfSpeech === 'verb' ? (
              <Select
                id="item-verb-type"
                label="Verb type"
                value={verbType}
                options={verbTypeOptions}
                onChange={(event) => setVerbType(event.target.value as VerbType | '')}
              />
            ) : null}
          </div>
          {partOfSpeech === 'verb' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="item-transitivity"
                label="Transitivity"
                value={transitivity}
                options={transitivityOptions}
                onChange={(event) =>
                  setTransitivity(event.target.value as Transitivity | '')
                }
              />
              <Input
                id="item-paired-with"
                label="Paired verb (optional)"
                placeholder="e.g. 開ける"
                value={pairedWithJapanese}
                onChange={(event) => setPairedWithJapanese(event.target.value)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <Input
        id="item-meaning"
        label="Meaning (English)"
        required
        value={meaning}
        onChange={(event) => setMeaning(event.target.value)}
      />
      <Textarea
        id="item-notes"
        label="Notes (optional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Topics (optional)
        </legend>
        {topics.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No topics yet.{' '}
            <Link to={routes.topics} className="underline">
              Create topics
            </Link>{' '}
            first.
          </p>
        ) : (
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={topicIds.includes(topic.id)}
                    onChange={() => toggleTopic(topic.id)}
                    className="rounded border-slate-300"
                  />
                  <span>
                    {topic.name}{' '}
                    <span className="text-slate-500">
                      ({topic.level} · {topic.skill})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Sources (optional)
        </legend>
        {sources.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No sources yet.{' '}
            <Link to={routes.topics} className="underline">
              Create sources
            </Link>{' '}
            first.
          </p>
        ) : (
          <ul className="space-y-3">
            {sources.map((source) => {
              const isSelected = sourceIds.includes(source.id);

              return (
                <li key={source.id} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSource(source.id)}
                      className="rounded border-slate-300"
                    />
                    <span>
                      {source.label}
                      {source.type ? (
                        <span className="text-slate-500"> ({source.type})</span>
                      ) : null}
                    </span>
                  </label>
                  {isSelected ? (
                    <Input
                      id={`item-source-ref-${source.id}`}
                      label="Reference (optional)"
                      value={sourceReferences[source.id] ?? ''}
                      onChange={(event) =>
                        setSourceReference(source.id, event.target.value)
                      }
                      placeholder="e.g. Unit 3, L15"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : isEditing ? 'Update item' : 'Save item'}
      </Button>
    </form>
  );
}

type ItemFormProps = {
  editId?: string;
  initialValues: ItemFormValues | null;
  formResetKey: number;
  isLoading: boolean;
  loadError: string | null;
  saveFeedback: SaveFeedback | null;
  isSaving: boolean;
  onSave: (values: ItemFormValues) => Promise<void>;
  isEditing: boolean;
};

export function ItemForm({
  editId,
  initialValues,
  formResetKey,
  isLoading,
  loadError,
  saveFeedback,
  isSaving,
  onSave,
  isEditing,
}: ItemFormProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (loadError) {
    return <FormAlert variant="error" message={loadError} />;
  }

  if (!initialValues) {
    return null;
  }

  return (
    <div className="space-y-4">
      {saveFeedback ? (
        <FormAlert variant={saveFeedback.type} message={saveFeedback.message} />
      ) : null}
      <ItemFormFields
        key={editId ?? `new-${formResetKey}`}
        initialValues={initialValues}
        editId={editId}
        onSave={onSave}
        isEditing={isEditing}
        isSaving={isSaving}
      />
    </div>
  );
}
