-- ====================================================================
-- AgroMind AI — Comprehensive PostgreSQL Schema Migration
-- 13 Tables with Row Level Security (RLS), Triggers & Performance Indexes
-- ====================================================================

-- 1. Enable pgcrypto / uuid-ossp for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 1. PROFILES (Farmer and KVK Agronomist Profiles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  district VARCHAR(100) NOT NULL,
  village VARCHAR(100) NOT NULL,
  taluka VARCHAR(100),
  pincode VARCHAR(10),
  age_group VARCHAR(20),
  pm_kisan_id VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  kyc_done BOOLEAN NOT NULL DEFAULT FALSE,
  language VARCHAR(10) NOT NULL DEFAULT 'gu' CHECK (language IN ('gu', 'hi', 'en')),
  sms_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  voice_assistance BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);

CREATE TRIGGER trigger_update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 2. FARMS (Farm Parcels & Geo-coordinates)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_area NUMERIC(8, 2) NOT NULL,
  cultivable_area NUMERIC(8, 2) NOT NULL,
  fallow_area NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  unit VARCHAR(50) NOT NULL DEFAULT 'Acre (એકર)',
  ownership VARCHAR(50) NOT NULL DEFAULT 'Own Land',
  soil_type VARCHAR(150) NOT NULL,
  water_sources TEXT[] NOT NULL DEFAULT '{}',
  irrigation_technique VARCHAR(100) NOT NULL,
  water_availability VARCHAR(100) NOT NULL,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  accuracy VARCHAR(50),
  season VARCHAR(50) NOT NULL DEFAULT 'Kharif 2026',
  survey_no VARCHAR(100),
  landmark VARCHAR(200),
  selected_crops TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);

CREATE TRIGGER trigger_update_farms_timestamp
BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 3. PLOTS (Micro-plots A, B, C, D)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plot_key VARCHAR(10) NOT NULL CHECK (plot_key IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  title VARCHAR(200) NOT NULL,
  crop VARCHAR(100) NOT NULL,
  sub_crop VARCHAR(100) NOT NULL,
  variety VARCHAR(100) NOT NULL,
  area VARCHAR(50) NOT NULL,
  stage_badge VARCHAR(100) NOT NULL,
  stage_name VARCHAR(100) NOT NULL,
  day_count VARCHAR(50) NOT NULL,
  progress_bar VARCHAR(20) NOT NULL,
  health VARCHAR(100) NOT NULL,
  moisture VARCHAR(100) NOT NULL,
  soil_type VARCHAR(150) NOT NULL,
  irrigation VARCHAR(150) NOT NULL,
  sync_time VARCHAR(100),
  provenance VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_plot_farmer_key UNIQUE (farmer_id, plot_key)
);

CREATE INDEX IF NOT EXISTS idx_plots_farmer_id ON public.plots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_plots_farm_id ON public.plots(farm_id);

CREATE TRIGGER trigger_update_plots_timestamp
BEFORE UPDATE ON public.plots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 4. CROPS (Crop Recommendations Knowledge Base)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(100) NOT NULL,
  name_gu VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100) NOT NULL,
  variety VARCHAR(150) NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  expected_profit VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  water_need VARCHAR(20) NOT NULL CHECK (water_need IN ('Low', 'Medium', 'High')),
  water_need_gu VARCHAR(50) NOT NULL,
  mandi_price VARCHAR(100) NOT NULL,
  price_trend VARCHAR(20) NOT NULL CHECK (price_trend IN ('up', 'stable', 'down')),
  soil_suitability VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  recommended_reason_gu TEXT NOT NULL,
  risk_factor VARCHAR(20) NOT NULL CHECK (risk_factor IN ('Low', 'Moderate', 'High')),
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crops_match_score ON public.crops(match_score);

CREATE TRIGGER trigger_update_crops_timestamp
BEFORE UPDATE ON public.crops
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 5. EXPENSES (Farm Accounting & Input Ledger)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  plot VARCHAR(100) NOT NULL,
  date VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Machinery', 'Irrigation')),
  category_gu VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('UPI', 'Cash', 'Mandli Credit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_farmer_id ON public.expenses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);

CREATE TRIGGER trigger_update_expenses_timestamp
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 6. REVENUES (Harvest Yield & Market Sales)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  season VARCHAR(100) NOT NULL,
  crop VARCHAR(100) NOT NULL,
  plot VARCHAR(100) NOT NULL,
  yield_quintals NUMERIC(10, 2) NOT NULL CHECK (yield_quintals >= 0),
  price_per_quintal NUMERIC(10, 2) NOT NULL CHECK (price_per_quintal >= 0),
  total_revenue NUMERIC(12, 2) NOT NULL CHECK (total_revenue >= 0),
  date VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenues_farmer_id ON public.revenues(farmer_id);

CREATE TRIGGER trigger_update_revenues_timestamp
BEFORE UPDATE ON public.revenues
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 7. DIAGNOSES (Pathology Reference Catalog)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop VARCHAR(100) NOT NULL,
  stage VARCHAR(100),
  disease_name VARCHAR(200) NOT NULL,
  disease_gu VARCHAR(200) NOT NULL,
  pest_name_en VARCHAR(200),
  pest_name_gu VARCHAR(200),
  scientific_name VARCHAR(200),
  confidence NUMERIC(5, 2) NOT NULL,
  confidence_label VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Severe', 'Mild')),
  severity_color VARCHAR(100) NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  treatments JSONB NOT NULL DEFAULT '[]'::jsonb,
  remedies JSONB NOT NULL DEFAULT '[]'::jsonb,
  warning TEXT,
  disclaimer TEXT NOT NULL DEFAULT 'AI diagnostic estimate only. Field-validate with certified KVK extension officer or agronomist before applying chemical pesticides.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON public.diagnoses(crop);

CREATE TRIGGER trigger_update_diagnoses_timestamp
BEFORE UPDATE ON public.diagnoses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 8. CROP SCANS (Historical Scans by Farmers with Images)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.crop_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE SET NULL,
  crop VARCHAR(100) NOT NULL,
  stage VARCHAR(100),
  disease_name VARCHAR(200) NOT NULL,
  disease_gu VARCHAR(200) NOT NULL,
  pest_name_en VARCHAR(200),
  pest_name_gu VARCHAR(200),
  scientific_name VARCHAR(200),
  confidence NUMERIC(5, 2) NOT NULL,
  confidence_label VARCHAR(150) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  severity_color VARCHAR(100) NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  treatments JSONB NOT NULL DEFAULT '[]'::jsonb,
  remedies JSONB NOT NULL DEFAULT '[]'::jsonb,
  warning TEXT,
  image_url TEXT,
  is_ai_estimate BOOLEAN NOT NULL DEFAULT TRUE,
  is_offline_fallback BOOLEAN NOT NULL DEFAULT FALSE,
  disclaimer TEXT NOT NULL DEFAULT 'AI diagnostic estimate only. Always consult a certified KVK agronomist before applying chemical treatments.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_scans_farmer_id ON public.crop_scans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_scans_created_at ON public.crop_scans(created_at DESC);

CREATE TRIGGER trigger_update_crop_scans_timestamp
BEFORE UPDATE ON public.crop_scans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 9. ALERTS (Pest Outbreaks, Weather Warnings, Action Center)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL indicates global broadcast
  category VARCHAR(50) NOT NULL CHECK (category IN ('urgent', 'weather', 'irrigation')),
  category_label VARCHAR(100) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_gu VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium')),
  severity_color VARCHAR(100) NOT NULL,
  time_label VARCHAR(100) NOT NULL,
  description_en TEXT NOT NULL,
  description_gu TEXT NOT NULL,
  action_text VARCHAR(150) NOT NULL,
  action_route VARCHAR(150) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_farmer_id ON public.alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);

CREATE TRIGGER trigger_update_alerts_timestamp
BEFORE UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 10. MANDI PRICES (Gujarat APMC Market Rates)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandi VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  distance VARCHAR(100) NOT NULL,
  crop VARCHAR(100) NOT NULL,
  crop_gu VARCHAR(100) NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  trend VARCHAR(20) NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
  change VARCHAR(50) NOT NULL,
  arrivals VARCHAR(50) NOT NULL,
  recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('SELL NOW', 'HOLD', 'FAIR')),
  rec_gu VARCHAR(150) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mandi_crop ON public.mandi_prices(crop);
CREATE INDEX IF NOT EXISTS idx_mandi_district ON public.mandi_prices(district);
CREATE INDEX IF NOT EXISTS idx_mandi_recorded_at ON public.mandi_prices(recorded_at DESC);

CREATE TRIGGER trigger_update_mandi_prices_timestamp
BEFORE UPDATE ON public.mandi_prices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 11. CHAT MESSAGES (AI Agronomy Advisory History)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
  text_en TEXT NOT NULL,
  text_gu TEXT NOT NULL,
  time_label VARCHAR(50) NOT NULL,
  suggestions TEXT[] NOT NULL DEFAULT '{}',
  is_ai_estimate BOOLEAN NOT NULL DEFAULT TRUE,
  is_offline_fallback BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_farmer_id ON public.chat_messages(farmer_id, created_at ASC);

-- ====================================================================
-- 12. USER PREFERENCES (Language, Notifications, Display)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL DEFAULT 'gu' CHECK (language IN ('gu', 'hi', 'en')),
  sms_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  voice_assistance BOOLEAN NOT NULL DEFAULT TRUE,
  theme VARCHAR(20) NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_update_user_preferences_timestamp
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 13. SYNC QUEUE (Offline Synchronization Engine & Queue)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_farmer_status ON public.sync_queue(farmer_id, status);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all 13 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth_user_id = auth.uid() OR is_admin())
  WITH CHECK (
    (auth_user_id = auth.uid() AND (role = 'farmer' OR is_admin()))
    OR is_admin()
  );

CREATE POLICY "Users can insert their profile on registration" ON public.profiles
  FOR INSERT WITH CHECK (
    auth_user_id = auth.uid() 
    AND (role = 'farmer' OR is_admin())
  );

-- 2. Farms Policies
CREATE POLICY "Farmers can manage their own farms" ON public.farms
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- 3. Plots Policies
CREATE POLICY "Farmers can manage their own plots" ON public.plots
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- 4. Crops Policies (Catalog is read-only for farmers, manageable by admins)
CREATE POLICY "Anyone authenticated can view crops" ON public.crops
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can modify crops catalog" ON public.crops
  FOR ALL USING (is_admin());

-- 5. Expenses Policies
CREATE POLICY "Farmers can manage their own expenses" ON public.expenses
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- 6. Revenues Policies
CREATE POLICY "Farmers can manage their own revenues" ON public.revenues
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- 7. Diagnoses Policies (Pathology catalog is public/authenticated read)
CREATE POLICY "Anyone can view pathology catalog" ON public.diagnoses
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage pathology catalog" ON public.diagnoses
  FOR ALL USING (is_admin());

-- 8. Crop Scans Policies
CREATE POLICY "Farmers can manage their own scans" ON public.crop_scans
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- 9. Alerts Policies
CREATE POLICY "Farmers can view alerts for them or broadcasts" ON public.alerts
  FOR SELECT USING (
    farmer_id IS NULL
    OR farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Farmers can update read status on their alerts" ON public.alerts
  FOR UPDATE USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all alerts" ON public.alerts
  FOR ALL USING (is_admin());

-- 10. Mandi Prices Policies
CREATE POLICY "Anyone can view mandi prices" ON public.mandi_prices
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage mandi prices" ON public.mandi_prices
  FOR ALL USING (is_admin());

-- 11. Chat Messages Policies
CREATE POLICY "Farmers can view and manage their chat messages" ON public.chat_messages
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- 12. User Preferences Policies
CREATE POLICY "Farmers can manage their own preferences" ON public.user_preferences
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

-- 13. Sync Queue Policies
CREATE POLICY "Farmers can manage their sync queue" ON public.sync_queue
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );
