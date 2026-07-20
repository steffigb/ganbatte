-- Multiple example sentences per learning item (Genki-style CSV rows)

CREATE TABLE public.item_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.learning_items (id) ON DELETE CASCADE,
  example TEXT NOT NULL,
  example_reading TEXT,
  example_meaning TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX item_examples_user_id_updated_at_idx
  ON public.item_examples (user_id, updated_at);

CREATE INDEX item_examples_item_id_idx
  ON public.item_examples (item_id);

CREATE UNIQUE INDEX item_examples_item_id_example_unique_idx
  ON public.item_examples (item_id, example)
  WHERE deleted_at IS NULL;

CREATE TRIGGER item_examples_set_updated_at
  BEFORE UPDATE ON public.item_examples
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.item_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_examples_select_own"
  ON public.item_examples FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "item_examples_insert_own"
  ON public.item_examples FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_examples_update_own"
  ON public.item_examples FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_examples_delete_own"
  ON public.item_examples FOR DELETE
  USING (user_id = auth.uid());
