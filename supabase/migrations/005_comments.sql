-- 005_comments.sql
-- Game comments system

CREATE TABLE IF NOT EXISTS game_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_comments_game_id ON game_comments(game_id);
CREATE INDEX IF NOT EXISTS idx_game_comments_created_at ON game_comments(created_at DESC);

-- Enable RLS
ALTER TABLE game_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "game_comments_select" ON game_comments FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "game_comments_insert" ON game_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "game_comments_delete" ON game_comments FOR DELETE
  USING (auth.uid() = user_id);
