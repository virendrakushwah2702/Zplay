-- Increment play count function
CREATE OR REPLACE FUNCTION increment_plays(game_id UUID)
RETURNS void AS $$
  UPDATE games SET
    play_count = play_count + 1,
    trending_score = trending_score + 1
  WHERE id = game_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Increment generations function
CREATE OR REPLACE FUNCTION increment_generations(user_id UUID)
RETURNS void AS $$
  UPDATE users SET
    free_generations_today = free_generations_today + 1
  WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Increment likes function
CREATE OR REPLACE FUNCTION increment_likes(game_id UUID)
RETURNS void AS $$
  UPDATE games SET
    like_count = like_count + 1,
    trending_score = trending_score + 2
  WHERE id = game_id;
$$ LANGUAGE sql SECURITY DEFINER;
