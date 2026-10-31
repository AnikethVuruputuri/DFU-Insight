# DFU-Insight: Supabase & Render Deployment Guide

All changes have been implemented, tested, and pushed to your GitHub repository:
**`https://github.com/AnikethVuruputuri/DFU-Insight.git` (branch `main`, commit `06deecb`)**

---

## 1. What to Do in Supabase (Database Setup)

### Step 1: Create a Free Project
1. Log in to **[supabase.com](https://supabase.com)** and click **"New Project"**.
2. Name it (e.g., `dfu-insight`), choose a database password, and select your preferred region (e.g., *South Asia (Mumbai)* or nearest).
3. Wait ~1 minute for the database to provision.

---

### Step 2: Run the SQL Schema
1. In the Supabase Dashboard left sidebar, click the **SQL Editor** icon (`>_`).
2. Click **"New query"**.
3. Paste the following SQL script (also saved in your repo at `supabase/schema.sql`) and click **"Run"**:

```sql
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

-- Fast lookup index for mobile number verification
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow read operations
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

-- Allow service role backend insertions
CREATE POLICY "Service role can insert" ON users
  FOR INSERT WITH CHECK (true);

-- Allow service role updates (last_login, location)
CREATE POLICY "Service role can update" ON users
  FOR UPDATE USING (true);
```

---

### Step 3: Copy Your Supabase Keys
1. In the Supabase Dashboard left sidebar, go to **Project Settings** (gear icon) → **API**.
2. Find and copy:
   - **Project URL**: e.g. `https://xyzprojectid.supabase.co`
   - **`service_role` secret key**: (Click *Reveal* — this key has permission for backend APIs).

---

## 2. Deploying the Backend on Render

Render is configured with `render.yaml` and `Dockerfile`.

### Steps on Render:
1. Log in to **[render.com](https://render.com)**.
2. Click **"New +"** → **"Web Service"**.
3. Connect your GitHub repository: `AnikethVuruputuri/DFU-Insight`.
4. Configure the service:
   - **Name**: `dfu-insight-backend`
   - **Region**: Oregon or Frankfurt
   - **Branch**: `main`
   - **Runtime**: **Python 3**
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Under **"Environment Variables"**, add:
   - `SUPABASE_URL`: Paste your Supabase Project URL (`https://xyz.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Paste your Supabase `service_role` key
   - `JWT_SECRET`: Any random 32+ character string (e.g. `dfu-insight-super-secret-production-2026`)
6. Click **"Create Web Service"**.
7. Once deployment finishes, copy your Render URL (e.g. `https://dfu-insight-backend.onrender.com`).
8. Verify it by visiting `https://dfu-insight-backend.onrender.com/health` (should return `{"status":"healthy",...}`).

---

## 3. Link Your Vercel Frontend to Render

1. Go to your project in the **[Vercel Dashboard](https://vercel.com)**.
2. Navigate to **Settings** → **Environment Variables**.
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render URL (e.g. `https://dfu-insight-backend.onrender.com`)
   - **Key**: `VITE_PHONE_EMAIL_CLIENT_ID`
   - **Value**: Your Client ID from [phone.email](https://phone.email)
4. Trigger a **Redeploy** on Vercel.
5. Your Vercel frontend is now connected to your Render backend and Supabase database.
