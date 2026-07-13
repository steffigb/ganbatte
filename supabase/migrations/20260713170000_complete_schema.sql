-- =============================================================================
-- Ganbatte JLPT App — remaining schema (§9.2–9.4)
-- Extends initial_schema: topics columns, all other tables, storage
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- topics — extend existing table from initial_schema
-- -----------------------------------------------------------------------------

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS parent_topic_id UUID REFERENCES public.topics (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_skill_check'
  ) THEN
    ALTER TABLE public.topics
      ADD CONSTRAINT topics_skill_check CHECK (
        skill IN ('vocabulary', 'kanji', 'grammar', 'reading', 'listening')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS topics_user_id_updated_at_idx
  ON public.topics (user_id, updated_at);

CREATE INDEX IF NOT EXISTS topics_user_id_level_skill_idx
  ON public.topics (user_id, level, skill);

DROP TRIGGER IF EXISTS topics_set_updated_at ON public.topics;

CREATE TRIGGER topics_set_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- sources
-- -----------------------------------------------------------------------------

CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT CHECK (
    type IS NULL
    OR type IN ('book', 'deck', 'video', 'podcast', 'list', 'other')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sources_user_id_updated_at_idx ON public.sources (user_id, updated_at);
CREATE INDEX sources_user_id_label_idx ON public.sources (user_id, label);

CREATE TRIGGER sources_set_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sources_select_own"
  ON public.sources FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "sources_insert_own"
  ON public.sources FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sources_update_own"
  ON public.sources FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sources_delete_own"
  ON public.sources FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- import_batches
-- -----------------------------------------------------------------------------

CREATE TABLE public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  filename TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  item_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX import_batches_user_id_updated_at_idx
  ON public.import_batches (user_id, updated_at);

CREATE TRIGGER import_batches_set_updated_at
  BEFORE UPDATE ON public.import_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_batches_select_own"
  ON public.import_batches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "import_batches_insert_own"
  ON public.import_batches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "import_batches_update_own"
  ON public.import_batches FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "import_batches_delete_own"
  ON public.import_batches FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- learning_items
-- -----------------------------------------------------------------------------

CREATE TABLE public.learning_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN ('word', 'kanji', 'grammar', 'reading', 'listening')
  ),
  level TEXT NOT NULL CHECK (level IN ('N5', 'N4')),
  skill TEXT NOT NULL CHECK (
    skill IN ('vocabulary', 'kanji', 'grammar', 'reading', 'listening')
  ),
  japanese TEXT NOT NULL,
  reading TEXT,
  meaning TEXT NOT NULL,
  meaning_alt TEXT,
  example TEXT,
  example_reading TEXT,
  notes TEXT,
  onyomi TEXT,
  kunyomi TEXT,
  passage_text TEXT,
  audio_storage_path TEXT,
  audio_url TEXT,
  audio_mime_type TEXT,
  questions JSONB,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_custom BOOLEAN NOT NULL DEFAULT true,
  import_batch_id UUID REFERENCES public.import_batches (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX learning_items_user_id_updated_at_idx
  ON public.learning_items (user_id, updated_at);

CREATE INDEX learning_items_user_id_japanese_type_idx
  ON public.learning_items (user_id, japanese, type);

CREATE INDEX learning_items_user_id_level_skill_idx
  ON public.learning_items (user_id, level, skill);

CREATE INDEX learning_items_tags_gin_idx
  ON public.learning_items USING GIN (tags);

CREATE TRIGGER learning_items_set_updated_at
  BEFORE UPDATE ON public.learning_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.learning_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_items_select_own"
  ON public.learning_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "learning_items_insert_own"
  ON public.learning_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "learning_items_update_own"
  ON public.learning_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "learning_items_delete_own"
  ON public.learning_items FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- item_sources
-- -----------------------------------------------------------------------------

CREATE TABLE public.item_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.learning_items (id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources (id) ON DELETE CASCADE,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, source_id)
);

CREATE INDEX item_sources_user_id_updated_at_idx
  ON public.item_sources (user_id, updated_at);

CREATE INDEX item_sources_item_id_idx ON public.item_sources (item_id);

CREATE INDEX item_sources_source_id_idx ON public.item_sources (source_id);

CREATE TRIGGER item_sources_set_updated_at
  BEFORE UPDATE ON public.item_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.item_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_sources_select_own"
  ON public.item_sources FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "item_sources_insert_own"
  ON public.item_sources FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_sources_update_own"
  ON public.item_sources FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_sources_delete_own"
  ON public.item_sources FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- item_topics
-- -----------------------------------------------------------------------------

CREATE TABLE public.item_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.learning_items (id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, topic_id)
);

CREATE INDEX item_topics_user_id_updated_at_idx
  ON public.item_topics (user_id, updated_at);

CREATE INDEX item_topics_item_id_idx ON public.item_topics (item_id);

CREATE INDEX item_topics_topic_id_idx ON public.item_topics (topic_id);

CREATE TRIGGER item_topics_set_updated_at
  BEFORE UPDATE ON public.item_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.item_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_topics_select_own"
  ON public.item_topics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "item_topics_insert_own"
  ON public.item_topics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_topics_update_own"
  ON public.item_topics FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_topics_delete_own"
  ON public.item_topics FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.learning_items (id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 5),
  response_time_ms INTEGER,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reviews_user_id_updated_at_idx
  ON public.reviews (user_id, updated_at);

CREATE INDEX reviews_user_id_item_id_reviewed_at_idx
  ON public.reviews (user_id, item_id, reviewed_at DESC);

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_own"
  ON public.reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- user_progress
-- -----------------------------------------------------------------------------

CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.learning_items (id) ON DELETE CASCADE,
  interval_days REAL NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_review_at TIMESTAMPTZ,
  mastery_level TEXT NOT NULL DEFAULT 'new' CHECK (
    mastery_level IN ('new', 'learning', 'familiar', 'mastered')
  ),
  accuracy_recent REAL CHECK (
    accuracy_recent IS NULL
    OR (accuracy_recent >= 0 AND accuracy_recent <= 100)
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX user_progress_user_id_updated_at_idx
  ON public.user_progress (user_id, updated_at);

CREATE INDEX user_progress_user_id_next_review_at_idx
  ON public.user_progress (user_id, next_review_at);

CREATE TRIGGER user_progress_set_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_select_own"
  ON public.user_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_progress_insert_own"
  ON public.user_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_progress_update_own"
  ON public.user_progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_progress_delete_own"
  ON public.user_progress FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- study_sessions
-- -----------------------------------------------------------------------------

CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  skills TEXT[] NOT NULL DEFAULT '{}',
  topic_ids UUID[] NOT NULL DEFAULT '{}',
  items_reviewed INTEGER NOT NULL DEFAULT 0,
  accuracy REAL CHECK (
    accuracy IS NULL
    OR (accuracy >= 0 AND accuracy <= 100)
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX study_sessions_user_id_updated_at_idx
  ON public.study_sessions (user_id, updated_at);

CREATE INDEX study_sessions_user_id_started_at_idx
  ON public.study_sessions (user_id, started_at DESC);

CREATE TRIGGER study_sessions_set_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_sessions_select_own"
  ON public.study_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "study_sessions_insert_own"
  ON public.study_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "study_sessions_update_own"
  ON public.study_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "study_sessions_delete_own"
  ON public.study_sessions FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- app_settings
-- -----------------------------------------------------------------------------

CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  exam_date DATE NOT NULL DEFAULT '2026-12-06',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 45,
  n5_recap_ratio REAL NOT NULL DEFAULT 0.2 CHECK (
    n5_recap_ratio >= 0 AND n5_recap_ratio <= 1
  ),
  locale TEXT NOT NULL DEFAULT 'de',
  theme TEXT NOT NULL DEFAULT 'system' CHECK (
    theme IN ('light', 'dark', 'system')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX app_settings_user_id_updated_at_idx
  ON public.app_settings (user_id, updated_at);

CREATE TRIGGER app_settings_set_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings_select_own"
  ON public.app_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "app_settings_insert_own"
  ON public.app_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "app_settings_update_own"
  ON public.app_settings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "app_settings_delete_own"
  ON public.app_settings FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Storage: listening-audio bucket (private)
-- Path convention: {user_id}/{item_id}/audio.{ext}
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listening-audio',
  'listening-audio',
  false,
  52428800,
  ARRAY[
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/x-m4a'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "listening_audio_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'listening-audio'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "listening_audio_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listening-audio'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "listening_audio_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'listening-audio'
    AND (storage.foldername (name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'listening-audio'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "listening_audio_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listening-audio'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );
