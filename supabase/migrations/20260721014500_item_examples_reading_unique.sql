-- Widen item_examples uniqueness: same word, different reading (Genki on/kun pairs)

DROP INDEX IF EXISTS public.item_examples_item_id_example_unique_idx;

CREATE UNIQUE INDEX item_examples_item_id_example_reading_unique_idx
  ON public.item_examples (item_id, example, COALESCE(example_reading, ''))
  WHERE deleted_at IS NULL;
