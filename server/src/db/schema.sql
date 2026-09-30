-- CropPilot AI Database Schema with Row Level Security (RLS)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  region_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state TEXT,
  district TEXT,
  soil_type TEXT,
  soil_ph DECIMAL(3,1),
  organic_matter TEXT,
  irrigation_method TEXT,
  farm_size_acres DECIMAL(10,2),
  primary_crops TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  image_url TEXT,
  symptoms_text TEXT,
  request_payload JSONB NOT NULL,
  ai_response JSONB NOT NULL,
  confidence_score INTEGER,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advice_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  request_payload JSONB NOT NULL,
  ai_response JSONB NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Agronomist Consultation',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_farm_id ON diagnoses(farm_id);
CREATE INDEX IF NOT EXISTS idx_advice_reports_user_id ON advice_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_advice_reports_farm_id ON advice_reports(farm_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to support idempotent migrations
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS farms_isolation ON farms;
DROP POLICY IF EXISTS diagnoses_isolation ON diagnoses;
DROP POLICY IF EXISTS advice_reports_isolation ON advice_reports;
DROP POLICY IF EXISTS chat_sessions_isolation ON chat_sessions;
DROP POLICY IF EXISTS chat_messages_isolation ON chat_messages;

-- RLS Policies
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (
    id = NULLIF(current_setting('app.current_user_id', true), '')::UUID 
    OR current_setting('app.current_user_id', true) IS NULL 
    OR current_setting('app.current_user_id', true) = ''
  );

CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (
    id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
  );

CREATE POLICY farms_isolation ON farms
  FOR ALL USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
  );

CREATE POLICY diagnoses_isolation ON diagnoses
  FOR ALL USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
  );

CREATE POLICY advice_reports_isolation ON advice_reports
  FOR ALL USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
  );

CREATE POLICY chat_sessions_isolation ON chat_sessions
  FOR ALL USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
  );

CREATE POLICY chat_messages_isolation ON chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    )
  );
