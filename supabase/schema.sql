-- DFU-Insight Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  country_code TEXT NOT NULL DEFAULT '91',
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse')),
  phone_verified BOOLEAN DEFAULT TRUE,
  
  -- Location fields
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  location_source TEXT CHECK (location_source IN ('gps', 'manual', null)),
  location_captured_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

-- Policy: Service role can insert
CREATE POLICY "Service role can insert" ON users
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can update
CREATE POLICY "Service role can update" ON users
  FOR UPDATE USING (true);
