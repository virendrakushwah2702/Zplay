-- Add Sparks balance to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS sparks_balance INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sparks_lifetime INTEGER DEFAULT 10;

-- Sparks transactions table
CREATE TABLE IF NOT EXISTS sparks_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  reference_id UUID,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sparks_user ON sparks_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sparks_type ON sparks_transactions(event_type);

-- Streak columns on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER DEFAULT 2;

-- Creator fields on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_activated_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- Creator earnings table
CREATE TABLE IF NOT EXISTS creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  earning_type TEXT NOT NULL,
  amount_sparks INTEGER DEFAULT 0,
  amount_inr DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_game ON creator_earnings(game_id);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_sparks INTEGER NOT NULL,
  amount_inr DECIMAL NOT NULL,
  method TEXT NOT NULL,
  upi_id TEXT,
  paypal_email TEXT,
  status TEXT DEFAULT 'requested',
  failure_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_creator ON withdrawals(creator_id);

-- Reports table (for moderation)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_game ON reports(game_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'signup',
  sparks_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add referral_code to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
