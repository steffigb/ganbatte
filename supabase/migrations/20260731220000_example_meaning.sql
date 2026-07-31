-- English translation of an item's own example sentence (`example`), so the
-- full sentence can be understood even when it uses grammar/vocab beyond the
-- item itself. Optional, alongside the existing `example` / `example_reading`.

ALTER TABLE public.learning_items
  ADD COLUMN IF NOT EXISTS example_meaning TEXT;
