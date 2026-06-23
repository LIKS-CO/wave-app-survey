-- Run this in your Neon SQL editor to create the responses table
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
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
