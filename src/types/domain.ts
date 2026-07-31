export type JlptLevel = 'N5' | 'N4';

export type Skill =
  | 'vocabulary'
  | 'kanji'
  | 'grammar'
  | 'reading'
  | 'listening';

export type ItemType = 'expression' | 'kanji' | 'grammar' | 'reading' | 'listening';

/** Kanji reading field: unset = not entered, none = confirmed absent, set = has value. */
export type ReadingStatus = 'unset' | 'none' | 'set';

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

export type Theme = 'light' | 'dark' | 'system';
