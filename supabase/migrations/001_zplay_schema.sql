-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  country_code TEXT DEFAULT 'US',
  language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'player',
  sparks_balance INTEGER DEFAULT 10,
  total_earnings_inr DECIMAL DEFAULT 0,
  total_earnings_usd DECIMAL DEFAULT 0,
  upi_id TEXT,
  paypal_email TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  free_generations_today INTEGER DEFAULT 0,
  last_generation_reset DATE DEFAULT CURRENT_DATE,
  ad_watched_token TEXT,
  ad_watched_at TIMESTAMPTZ,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAMES TABLE
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  html_content TEXT NOT NULL,
  thumbnail_url TEXT,
  genre TEXT DEFAULT 'other',
  language TEXT DEFAULT 'en',
  country_origin TEXT DEFAULT 'US',
  status TEXT DEFAULT 'draft',
  is_paid BOOLEAN DEFAULT FALSE,
  price_usd DECIMAL DEFAULT 0,
  price_inr INTEGER DEFAULT 0,
  ai_model_used TEXT DEFAULT 'deepseek-chat',
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  total_ad_revenue_usd DECIMAL DEFAULT 0,
  creator_revenue_usd DECIMAL DEFAULT 0,
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_expires_at TIMESTAMPTZ,
  trending_score DECIMAL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAME PLAYS TABLE
CREATE TABLE game_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_duration_seconds INTEGER DEFAULT 0,
  country_code TEXT DEFAULT 'US',
  platform TEXT DEFAULT 'web',
  ad_revenue_generated_usd DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AD EVENTS TABLE
CREATE TABLE ad_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ad_type TEXT NOT NULL,
  ad_unit_id TEXT,
  revenue_usd DECIMAL DEFAULT 0,
  country_code TEXT DEFAULT 'US',
  verified BOOLEAN DEFAULT FALSE,
  callback_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount_inr DECIMAL,
  amount_usd DECIMAL,
  currency TEXT DEFAULT 'USD',
  sparks_credited INTEGER DEFAULT 0,
  payment_gateway TEXT,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATOR EARNINGS TABLE
CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  earning_type TEXT NOT NULL,
  amount_usd DECIMAL DEFAULT 0,
  amount_inr DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WITHDRAWALS TABLE
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_usd DECIMAL,
  amount_inr DECIMAL,
  currency TEXT,
  method TEXT,
  upi_id TEXT,
  paypal_email TEXT,
  status TEXT DEFAULT 'requested',
  gateway_payout_id TEXT,
  failure_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- SOCIAL TABLE
CREATE TABLE social (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  content TEXT,
  sparks_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id, action)
);

-- INDEXES for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_trending ON games(trending_score DESC);
CREATE INDEX idx_games_creator ON games(creator_id);
CREATE INDEX idx_game_plays_game ON game_plays(game_id);
CREATE INDEX idx_creator_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX idx_social_game ON social(game_id);

-- ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE social ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public games are viewable by all" ON games
  FOR SELECT USING (status = 'published');
CREATE POLICY "Creators can manage own games" ON games
  FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Users can read own earnings" ON creator_earnings
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can record plays" ON game_plays
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can like/comment" ON social
  FOR ALL USING (auth.uid() = user_id);
