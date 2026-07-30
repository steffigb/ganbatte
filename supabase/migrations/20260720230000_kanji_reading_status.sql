-- Kanji reading tri-state: unset | none | set
-- Kanji items only ever carry onyomi + kunyomi; there is no standalone
-- "kun when the kanji stands alone" concept (no dictionary lists one; the
-- actually-used reading is learned via linked vocabulary, derived live).

ALTER TABLE public.learning_items
  ADD COLUMN IF NOT EXISTS onyomi_status TEXT NOT NULL DEFAULT 'unset'
    CHECK (onyomi_status IN ('unset', 'none', 'set')),
  ADD COLUMN IF NOT EXISTS kunyomi_status TEXT NOT NULL DEFAULT 'unset'
    CHECK (kunyomi_status IN ('unset', 'none', 'set'));

-- Legacy rows with a value but no explicit status
UPDATE public.learning_items
SET onyomi_status = 'set'
WHERE onyomi IS NOT NULL AND btrim(onyomi) <> '' AND onyomi_status = 'unset';

UPDATE public.learning_items
SET kunyomi_status = 'set'
WHERE kunyomi IS NOT NULL AND btrim(kunyomi) <> '' AND kunyomi_status = 'unset';
