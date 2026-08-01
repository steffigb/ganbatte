-- Extends the part_of_speech CHECK constraint with categories surfaced by
-- importing full JLPT N5/N4 vocabulary lists that had no good fit in the
-- original 8-value set: pronoun, counter, interjection, prefix, suffix,
-- determiner, and phrase (fixed/set expressions, e.g. ～ございます, 下さい —
-- named "phrase" rather than "expression" to avoid clashing with
-- learning_items.type's own "expression" value). See ADR-016 in PLAN.md.

ALTER TABLE public.learning_items
  DROP CONSTRAINT IF EXISTS learning_items_part_of_speech_check;

ALTER TABLE public.learning_items
  ADD CONSTRAINT learning_items_part_of_speech_check
    CHECK (
      part_of_speech IS NULL OR part_of_speech IN (
        'noun', 'pronoun', 'verb', 'i-adjective', 'na-adjective', 'adverb',
        'particle', 'conjunction', 'interjection', 'counter', 'prefix',
        'suffix', 'determiner', 'phrase', 'other'
      )
    );
