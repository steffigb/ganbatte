-- The daily new-item cap is gone: lesson batches are now chosen per session
-- (filters + explicit item picks on the lesson setup screen), so this column
-- no longer caps anything — it only pre-fills the batch size. Renamed to match.
-- See PLAN.md for the lesson setup flow.

-- Guarded so re-running the migration set stays a no-op, matching the
-- IF NOT EXISTS style of 20260801020000_new_items_per_day.sql.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'app_settings'
      AND column_name = 'new_items_per_day'
  ) THEN
    ALTER TABLE public.app_settings
      RENAME COLUMN new_items_per_day TO default_lesson_size;
  END IF;
END $$;

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS default_lesson_size integer NOT NULL DEFAULT 8;
