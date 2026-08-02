-- Grammar-only content fields: `explanation` (usage nuance, contrast with
-- confusable sibling patterns) and `formation` (the construction rule, e.g.
-- "Verb て form + もいいです"). Both are optional free text, alongside the
-- existing example/example_reading/example_meaning fields.
--
-- related_vocabulary/related_kanji were considered and rejected: that
-- relationship is derived live from `example` (kanji <-> compound precedent,
-- see part_of_speech migration comment) instead of stored, to avoid a
-- staleness-prone field.

ALTER TABLE public.learning_items
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS formation TEXT;
