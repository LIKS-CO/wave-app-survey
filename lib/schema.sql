-- Run this in your Neon SQL editor to create the responses table
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  sport TEXT NOT NULL,
  routine TEXT NOT NULL,
  intensity INTEGER NOT NULL,
  cues INTEGER NOT NULL,
  discomfort TEXT[] DEFAULT '{}',
  ease INTEGER NOT NULL,
  science_clarity TEXT NOT NULL,
  best_feature TEXT,
  likelihood INTEGER NOT NULL,
  open_feedback TEXT DEFAULT ''
);

-- If you already created the table without the name column, run:
-- ALTER TABLE responses ADD COLUMN name TEXT;
