-- ====================================================================
-- AgroMind AI — Soil Reports Table & Demo Farmer Seed Migration
-- Dedicated to preserving the Demo Account and isolating real farmers
-- ====================================================================

-- 1. Ensure onboarding_completed column exists on profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. CREATE TABLE: soil_reports
CREATE TABLE IF NOT EXISTS public.soil_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  lab_name VARCHAR(255),
  sample_date DATE,
  ph NUMERIC(4, 2),
  nitrogen_kg_ha NUMERIC(8, 2),
  phosphorus_kg_ha NUMERIC(8, 2),
  potassium_kg_ha NUMERIC(8, 2),
  organic_carbon_percent NUMERIC(4, 2),
  micronutrients JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending_confirmation', 'confirmed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soil_reports_farmer_id ON public.soil_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_soil_reports_farm_id ON public.soil_reports(farm_id);

CREATE TRIGGER trigger_update_soil_reports_timestamp
BEFORE UPDATE ON public.soil_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on soil_reports
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage their own soil reports" ON public.soil_reports
  FOR ALL USING (
    farmer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- ====================================================================
-- 3. SEED DEDICATED DEMO ACCOUNT (Associated with Demo Auth User)
-- Demo Auth User UUID: 34f08041-d117-4f95-bee4-7a908f4131e8
-- ====================================================================

DO $$
DECLARE
  v_demo_auth_id UUID := '34f08041-d117-4f95-bee4-7a908f4131e8';
  v_profile_id UUID;
  v_farm_id UUID := '00000000-0000-0000-0000-000000000010';
BEGIN
  -- 3.1 Demo Profile
  INSERT INTO public.profiles (
    id,
    auth_user_id,
    name,
    phone,
    district,
    village,
    taluka,
    pincode,
    age_group,
    pm_kisan_id,
    role,
    kyc_done,
    language,
    sms_alerts,
    whatsapp_alerts,
    voice_assistance,
    onboarding_completed
  ) VALUES (
    v_demo_auth_id,
    v_demo_auth_id,
    'Rameshbhai Patel',
    '9876543210',
    'Surat',
    'Kamrej Gam (કામરેજ ગામ)',
    'Kamrej',
    '394185',
    '35-45 yrs',
    'GJ-SUR-88412',
    'farmer',
    TRUE,
    'gu',
    TRUE,
    TRUE,
    TRUE,
    TRUE
  )
  ON CONFLICT (phone) DO UPDATE SET
    auth_user_id = v_demo_auth_id,
    name = 'Rameshbhai Patel',
    onboarding_completed = TRUE
  RETURNING id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id FROM public.profiles WHERE phone = '9876543210';
  END IF;

  -- 3.2 Demo Farm
  INSERT INTO public.farms (
    id,
    farmer_id,
    total_area,
    cultivable_area,
    fallow_area,
    unit,
    ownership,
    soil_type,
    water_sources,
    irrigation_technique,
    water_availability,
    lat,
    lng,
    accuracy,
    season,
    survey_no,
    landmark,
    selected_crops
  ) VALUES (
    v_farm_id,
    v_profile_id,
    4.5,
    4.0,
    0.5,
    'Acre (એકર)',
    'Own Land',
    'Deep Black Cotton Soil (કાળી કાંપવાળી)',
    ARRAY['Borewell', 'Canal'],
    'Drip Irrigation',
    '12 Months',
    21.2721,
    72.9546,
    '4.2m (High Precision)',
    'Kharif 2026',
    'Block 142/A',
    'Near Canal / નહેર પાસે',
    ARRAY['cotton', 'groundnut']
  )
  ON CONFLICT (id) DO UPDATE SET
    farmer_id = v_profile_id,
    total_area = 4.5,
    cultivable_area = 4.0;

  -- 3.3 Demo Plots (A & B)
  INSERT INTO public.plots (
    id,
    farm_id,
    farmer_id,
    plot_key,
    title,
    crop,
    sub_crop,
    variety,
    area,
    stage_badge,
    stage_name,
    day_count,
    progress_bar,
    health,
    moisture,
    soil_type,
    irrigation,
    sync_time,
    provenance
  ) VALUES (
    '00000000-0000-0000-0000-000000000021',
    v_farm_id,
    v_profile_id,
    'A',
    'Plot Details: Block A (બ્લોક એ - કપાસ)',
    'Shankar-6 Cotton',
    'કપાસ',
    'Gujarat Cotton Hybrid-16',
    '2.5 Acres',
    'Flowering (Day 54/150)',
    'Flowering Stage',
    'Day 54',
    '36%',
    'Good (તંદુરસ્ત)',
    '68% (Optimal / ઉત્તમ)',
    'Deep Black Cotton Soil (કાળી કાંપવાળી)',
    'Drip (Next: Tomorrow 7:00 AM)',
    'Today, 09:30 AM',
    'Measured • IoT Probes'
  )
  ON CONFLICT (farmer_id, plot_key) DO UPDATE SET
    crop = 'Shankar-6 Cotton',
    stage_badge = 'Flowering (Day 54/150)';

  INSERT INTO public.plots (
    id,
    farm_id,
    farmer_id,
    plot_key,
    title,
    crop,
    sub_crop,
    variety,
    area,
    stage_badge,
    stage_name,
    day_count,
    progress_bar,
    health,
    moisture,
    soil_type,
    irrigation,
    sync_time,
    provenance
  ) VALUES (
    '00000000-0000-0000-0000-000000000022',
    v_farm_id,
    v_profile_id,
    'B',
    'Plot Details: Block B (બ્લોક બી - મગફળી)',
    'GG-20 Groundnut',
    'મગફળી',
    'Gujarat Groundnut-20',
    '2.0 Acres',
    'Vegetative (Day 32/110)',
    'Vegetative Stage',
    'Day 32',
    '29%',
    'Excellent (ઉત્કૃષ્ટ)',
    '72% (Adequate / યોગ્ય)',
    'Sandy Loamy Soil (ગોરાડુ જમીન)',
    'Sprinkler (Next: Thursday)',
    'Today, 08:15 AM',
    'Estimated • Sentinel-2 + Weather'
  )
  ON CONFLICT (farmer_id, plot_key) DO UPDATE SET
    crop = 'GG-20 Groundnut',
    stage_badge = 'Vegetative (Day 32/110)';

  -- 3.4 Demo Soil Report
  INSERT INTO public.soil_reports (
    id,
    farmer_id,
    farm_id,
    lab_name,
    sample_date,
    ph,
    nitrogen_kg_ha,
    phosphorus_kg_ha,
    potassium_kg_ha,
    organic_carbon_percent,
    micronutrients,
    status,
    notes
  ) VALUES (
    '00000000-0000-0000-0000-000000000030',
    v_profile_id,
    v_farm_id,
    'Navsari Agricultural University Soil Testing Lab (KVK Surat)',
    '2026-08-14',
    7.4,
    182,
    24,
    310,
    0.58,
    '{"zincPpm": 0.65, "ironPpm": 4.8, "manganesePpm": 5.2}'::jsonb,
    'confirmed',
    'Sample taken from Block A & B topsoil. Low phosphorus requires Single Super Phosphate (SSP) split dressing.'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
