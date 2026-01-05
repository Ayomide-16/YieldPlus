-- ================================================
-- YieldPlus Lifecycle System - Database Migration
-- Run this in your Supabase SQL Editor
-- ================================================

-- ================================================
-- ACTIVE FARMS TABLE
-- Core table for tracking farms with active seasons
-- ================================================
CREATE TABLE IF NOT EXISTS public.active_farms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  farm_name TEXT NOT NULL,
  location JSONB NOT NULL, -- {country, state, lga, lat, lon}
  farm_size NUMERIC NOT NULL,
  size_unit TEXT DEFAULT 'hectares',
  soil_profile JSONB, -- from soil analysis
  crop TEXT NOT NULL,
  crop_variety TEXT,
  water_access TEXT, -- none, well, borehole, river, municipal
  irrigation_method TEXT, -- drip, sprinkler, flood, manual, none
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  current_growth_stage TEXT DEFAULT 'pre-planting',
  days_in_stage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'archived', 'paused')),
  plan_id UUID REFERENCES public.comprehensive_plans(id) ON DELETE SET NULL,
  budget NUMERIC,
  budget_spent NUMERIC DEFAULT 0,
  expected_yield NUMERIC,
  expected_revenue NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- FARM ACTIVITIES TABLE
-- Logs all activities and recommendation completions
-- ================================================
CREATE TABLE IF NOT EXISTS public.farm_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.active_farms(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- irrigation, fertilization, inspection, planting, weeding, pest_treatment, harvest, etc.
  activity_date DATE NOT NULL,
  scheduled_date DATE, -- if from recommendation
  recommendation_id UUID, -- links to daily_recommendations.recommendations[].id
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'delayed')),
  completion_date TIMESTAMPTZ,
  notes TEXT,
  cost NUMERIC,
  resources_used JSONB, -- [{name, quantity, unit, cost}]
  weather_at_time JSONB, -- snapshot of weather when activity was done
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- DAILY RECOMMENDATIONS TABLE
-- Stores generated daily briefings for each farm
-- ================================================
CREATE TABLE IF NOT EXISTS public.daily_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.active_farms(id) ON DELETE CASCADE NOT NULL,
  recommendation_date DATE NOT NULL,
  days_since_planting INTEGER NOT NULL,
  current_stage TEXT NOT NULL,
  briefing TEXT, -- summary text
  recommendations JSONB NOT NULL, -- array of recommendation objects
  weather_data JSONB NOT NULL, -- weather at time of generation
  farm_status JSONB, -- {isOnTrack, concerns, positives}
  user_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farm_id, recommendation_date)
);

-- ================================================
-- FARM FEEDBACK TABLE
-- Captures user confirmations and observations
-- ================================================
CREATE TABLE IF NOT EXISTS public.farm_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.active_farms(id) ON DELETE CASCADE NOT NULL,
  feedback_type TEXT NOT NULL, -- weather_confirmation, growth_milestone, issue_report, photo_analysis, soil_check
  feedback_date DATE NOT NULL,
  question TEXT, -- what was asked
  user_response JSONB NOT NULL, -- user's answer
  ai_interpretation TEXT, -- how AI interpreted the feedback
  plan_adjusted BOOLEAN DEFAULT FALSE,
  adjustments_made JSONB, -- what changes were triggered
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- WEATHER CACHE TABLE
-- Caches weather data with timestamps
-- ================================================
CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_key TEXT NOT NULL, -- "lat_lon" or "country_state_lga"
  location JSONB NOT NULL, -- full location object
  weather_type TEXT NOT NULL, -- current, forecast_daily, forecast_hourly, climate_monthly
  weather_data JSONB NOT NULL,
  source TEXT NOT NULL, -- openweathermap, nasa_power, etc.
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(location_key, weather_type)
);

-- ================================================
-- WEATHER HISTORY TABLE
-- Historical weather records for analysis
-- ================================================
CREATE TABLE IF NOT EXISTS public.weather_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location JSONB NOT NULL,
  weather_date DATE NOT NULL,
  temperature_high NUMERIC,
  temperature_low NUMERIC,
  temperature_avg NUMERIC,
  rainfall NUMERIC DEFAULT 0,
  humidity NUMERIC,
  conditions TEXT,
  wind_speed NUMERIC,
  was_forecasted BOOLEAN DEFAULT FALSE,
  forecast_accuracy NUMERIC, -- if we compared forecast vs actual
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MARKET PRICE HISTORY TABLE (Enhanced)
-- Replace or supplement existing market_prices
-- ================================================
CREATE TABLE IF NOT EXISTS public.market_price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  variety TEXT,
  state TEXT NOT NULL,
  lga TEXT,
  market_name TEXT,
  price NUMERIC NOT NULL,
  unit TEXT DEFAULT 'per kg',
  price_date DATE NOT NULL,
  source TEXT NOT NULL, -- nbs, user_contributed, admin_entry
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('high', 'medium', 'low')),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CHAT HISTORY TABLE (Enhanced with farm context)
-- ================================================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES public.active_farms(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  farm_context JSONB, -- snapshot of farm data at time of chat
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- HARVEST RECORDS TABLE
-- Track actual harvest outcomes
-- ================================================
CREATE TABLE IF NOT EXISTS public.harvest_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.active_farms(id) ON DELETE CASCADE NOT NULL,
  harvest_date DATE NOT NULL,
  actual_yield NUMERIC NOT NULL,
  yield_unit TEXT DEFAULT 'kg',
  quality_rating NUMERIC CHECK (quality_rating >= 1 AND quality_rating <= 10),
  selling_strategy TEXT, -- immediate, stored, partial
  storage_location TEXT,
  sale_price NUMERIC,
  sale_date DATE,
  sale_channel TEXT, -- farm_gate, local_market, middleman, retailer, exchange
  revenue NUMERIC,
  total_investment NUMERIC, -- final tally of all costs
  profit NUMERIC,
  roi NUMERIC, -- percentage
  lessons_learned TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CROP KNOWLEDGE BASE TABLE
-- Store crop-specific information
-- ================================================
CREATE TABLE IF NOT EXISTS public.crop_database (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  crop_name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  category TEXT, -- cereal, legume, tuber, vegetable, fruit, cash_crop
  growth_stages JSONB, -- [{stage_name, duration_days, description}]
  total_duration_days INTEGER,
  soil_requirements JSONB,
  climate_requirements JSONB,
  water_requirements_per_day NUMERIC, -- liters per hectare
  nutrient_requirements JSONB, -- {N, P, K, secondary, micro}
  common_pests JSONB, -- [{name, risk_period, symptoms, treatment}]
  common_diseases JSONB,
  planting_methods JSONB,
  spacing_recommendations JSONB,
  expected_yield_per_hectare JSONB, -- {low, average, high, unit}
  harvest_indicators JSONB,
  storage_characteristics JSONB,
  market_demand_level TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES for performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_active_farms_user ON public.active_farms(user_id);
CREATE INDEX IF NOT EXISTS idx_active_farms_status ON public.active_farms(status);
CREATE INDEX IF NOT EXISTS idx_active_farms_planting_date ON public.active_farms(planting_date);

CREATE INDEX IF NOT EXISTS idx_farm_activities_farm ON public.farm_activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_date ON public.farm_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_farm_activities_status ON public.farm_activities(status);

CREATE INDEX IF NOT EXISTS idx_daily_recommendations_farm ON public.daily_recommendations(farm_id);
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_date ON public.daily_recommendations(recommendation_date);

CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON public.weather_cache(location_key);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON public.weather_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_market_price_history_crop ON public.market_price_history(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_price_history_state ON public.market_price_history(state);
CREATE INDEX IF NOT EXISTS idx_market_price_history_date ON public.market_price_history(price_date);

CREATE INDEX IF NOT EXISTS idx_chat_history_user ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_farm ON public.chat_history(farm_id);

-- ================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.active_farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_database ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES FOR ACTIVE_FARMS
-- ================================================
CREATE POLICY "Users can view own active farms"
  ON public.active_farms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create active farms"
  ON public.active_farms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active farms"
  ON public.active_farms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own active farms"
  ON public.active_farms FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES FOR FARM_ACTIVITIES
-- ================================================
CREATE POLICY "Users can view own farm activities"
  ON public.farm_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = farm_activities.farm_id
    AND active_farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create farm activities"
  ON public.farm_activities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = farm_activities.farm_id
    AND active_farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own farm activities"
  ON public.farm_activities FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = farm_activities.farm_id
    AND active_farms.user_id = auth.uid()
  ));

-- ================================================
-- RLS POLICIES FOR DAILY_RECOMMENDATIONS
-- ================================================
CREATE POLICY "Users can view own daily recommendations"
  ON public.daily_recommendations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = daily_recommendations.farm_id
    AND active_farms.user_id = auth.uid()
  ));

CREATE POLICY "Service role can insert recommendations"
  ON public.daily_recommendations FOR INSERT
  WITH CHECK (true); -- Edge functions use service role

-- ================================================
-- RLS POLICIES FOR FARM_FEEDBACK
-- ================================================
CREATE POLICY "Users can view own farm feedback"
  ON public.farm_feedback FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = farm_feedback.farm_id
    AND active_farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create farm feedback"
  ON public.farm_feedback FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = farm_feedback.farm_id
    AND active_farms.user_id = auth.uid()
  ));

-- ================================================
-- RLS POLICIES FOR WEATHER_CACHE (Public read for caching)
-- ================================================
CREATE POLICY "Anyone can view weather cache"
  ON public.weather_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage weather cache"
  ON public.weather_cache FOR ALL
  USING (true);

-- ================================================
-- RLS POLICIES FOR WEATHER_HISTORY (Public read)
-- ================================================
CREATE POLICY "Anyone can view weather history"
  ON public.weather_history FOR SELECT
  USING (true);

-- ================================================
-- RLS POLICIES FOR MARKET_PRICE_HISTORY (Public read)
-- ================================================
CREATE POLICY "Anyone can view market price history"
  ON public.market_price_history FOR SELECT
  USING (true);

-- ================================================
-- RLS POLICIES FOR CHAT_HISTORY
-- ================================================
CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat history"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES FOR HARVEST_RECORDS
-- ================================================
CREATE POLICY "Users can view own harvest records"
  ON public.harvest_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = harvest_records.farm_id
    AND active_farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create harvest records"
  ON public.harvest_records FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = harvest_records.farm_id
    AND active_farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own harvest records"
  ON public.harvest_records FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.active_farms
    WHERE active_farms.id = harvest_records.farm_id
    AND active_farms.user_id = auth.uid()
  ));

-- ================================================
-- RLS POLICIES FOR CROP_DATABASE (Public read)
-- ================================================
CREATE POLICY "Anyone can view crop database"
  ON public.crop_database FOR SELECT
  USING (true);

-- ================================================
-- TRIGGER: Update active_farms.updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_active_farms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_active_farms_updated_at
  BEFORE UPDATE ON public.active_farms
  FOR EACH ROW
  EXECUTE FUNCTION update_active_farms_updated_at();

-- ================================================
-- TRIGGER: Update last_activity on farm_activities insert
-- ================================================
CREATE OR REPLACE FUNCTION update_farm_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.active_farms
  SET last_activity = NOW()
  WHERE id = NEW.farm_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_farm_last_activity
  AFTER INSERT ON public.farm_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_farm_last_activity();

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
SELECT 'YieldPlus Lifecycle System schema created successfully!' AS status;
