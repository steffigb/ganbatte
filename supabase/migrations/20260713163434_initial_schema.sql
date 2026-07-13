-- topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('N5', 'N4')),
  skill TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own topics"
  ON topics FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
