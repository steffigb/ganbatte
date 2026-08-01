-- Grammatical word-class metadata for expression items: part of speech,
-- verb conjugation group, transitivity, and an optional link to a paired
-- transitive/intransitive counterpart verb (e.g. 開く <-> 開ける).
--
-- Only one side of a pair needs to store paired_item_id — the reverse
-- direction is resolved live in the app (findPairedItem), consistent with
-- the kanji <-> compound relationship being derived rather than stored twice.

ALTER TABLE public.learning_items
  ADD COLUMN IF NOT EXISTS part_of_speech TEXT
    CHECK (
      part_of_speech IS NULL OR part_of_speech IN (
        'noun', 'verb', 'i-adjective', 'na-adjective', 'adverb',
        'particle', 'conjunction', 'other'
      )
    ),
  ADD COLUMN IF NOT EXISTS verb_type TEXT
    CHECK (verb_type IS NULL OR verb_type IN ('godan', 'ichidan', 'irregular')),
  ADD COLUMN IF NOT EXISTS transitivity TEXT
    CHECK (transitivity IS NULL OR transitivity IN ('transitive', 'intransitive', 'both')),
  ADD COLUMN IF NOT EXISTS paired_item_id UUID
    REFERENCES public.learning_items (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS learning_items_paired_item_id_idx
  ON public.learning_items (paired_item_id);
