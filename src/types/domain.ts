export type JlptLevel = 'N5' | 'N4';

export type Skill =
  | 'vocabulary'
  | 'kanji'
  | 'grammar'
  | 'reading'
  | 'listening';

export type ItemType = 'expression' | 'kanji' | 'grammar' | 'reading' | 'listening';

/** Grammatical word class — only meaningful for `type: "expression"` items. */
export type PartOfSpeech =
  | 'noun'
  | 'pronoun'
  | 'verb'
  | 'i-adjective'
  | 'na-adjective'
  | 'adverb'
  | 'particle'
  | 'conjunction'
  | 'interjection'
  | 'counter'
  | 'prefix'
  | 'suffix'
  | 'determiner'
  | 'phrase'
  | 'other';

/** Verb conjugation group — only set when `partOfSpeech === 'verb'`. */
export type VerbType = 'godan' | 'ichidan' | 'irregular';

/** Only set when `partOfSpeech === 'verb'`. */
export type Transitivity = 'transitive' | 'intransitive' | 'both';

/** Kanji reading field: unset = not entered, none = confirmed absent, set = has value. */
export type ReadingStatus = 'unset' | 'none' | 'set';

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

export type Theme = 'light' | 'dark' | 'system';
