-- Adds a per-user daily cap for how many brand-new items are introduced via
-- the Lessons flow, mirroring app_settings.n5_recap_ratio's pattern of a
-- tunable knob for the study/review pipeline. See PLAN.md for the
-- lessons-vs-reviews split this supports.

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS new_items_per_day integer NOT NULL DEFAULT 8;
