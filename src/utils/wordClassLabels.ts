import type { PartOfSpeech, Transitivity, VerbType } from '@/types/domain';

const PART_OF_SPEECH_LABELS: Record<PartOfSpeech, string> = {
  noun: 'Noun',
  pronoun: 'Pronoun',
  verb: 'Verb',
  'i-adjective': 'い-adjective',
  'na-adjective': 'な-adjective',
  adverb: 'Adverb',
  particle: 'Particle',
  conjunction: 'Conjunction',
  interjection: 'Interjection',
  counter: 'Counter',
  prefix: 'Prefix',
  suffix: 'Suffix',
  determiner: 'Determiner',
  phrase: 'Phrase / set expression',
  other: 'Other',
};

const VERB_TYPE_LABELS: Record<VerbType, string> = {
  godan: 'Godan',
  ichidan: 'Ichidan',
  irregular: 'Irregular',
};

const TRANSITIVITY_LABELS: Record<Transitivity, string> = {
  transitive: 'Transitive',
  intransitive: 'Intransitive',
  both: 'Both',
};

export function partOfSpeechLabel(value?: PartOfSpeech): string | undefined {
  return value ? PART_OF_SPEECH_LABELS[value] : undefined;
}

export function verbTypeLabel(value?: VerbType): string | undefined {
  return value ? VERB_TYPE_LABELS[value] : undefined;
}

export function transitivityLabel(value?: Transitivity): string | undefined {
  return value ? TRANSITIVITY_LABELS[value] : undefined;
}
