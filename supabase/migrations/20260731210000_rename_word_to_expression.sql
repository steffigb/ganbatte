-- Rename learning_items.type value 'word' -> 'expression'.
-- Vocabulary entries are frequently multi-word (verbs, set phrases, e.g. お腹が空く),
-- not single dictionary words, so 'expression' better reflects what the type covers.
-- 'skill' remains 'vocabulary' for these items — only the narrower `type` enum value changes.

ALTER TABLE public.learning_items
  DROP CONSTRAINT IF EXISTS learning_items_type_check;

UPDATE public.learning_items
SET type = 'expression'
WHERE type = 'word';

ALTER TABLE public.learning_items
  ADD CONSTRAINT learning_items_type_check
  CHECK (type IN ('expression', 'kanji', 'grammar', 'reading', 'listening'));
