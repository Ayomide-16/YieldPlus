-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own plans" ON public.saved_plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON public.saved_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.saved_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON public.saved_plans;

-- Create saved_plans RLS policies
CREATE POLICY "Users can view their own plans"
  ON public.saved_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON public.saved_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.saved_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.saved_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create farms table for comprehensive farm management
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  location JSONB NOT NULL,
  total_size NUMERIC NOT NULL,
  soil_type TEXT,
  water_source TEXT,
  irrigation_method TEXT,
  crops JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Farms RLS Policies
CREATE POLICY "Users can view their own farms"
  ON public.farms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farms"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms"
  ON public.farms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms"
  ON public.farms FOR DELETE
  USING (auth.uid() = user_id);

-- Create comprehensive_plans table
CREATE TABLE IF NOT EXISTS public.comprehensive_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  season TEXT,
  included_sections JSONB NOT NULL,
  crop_analysis JSONB,
  soil_analysis JSONB,
  water_analysis JSONB,
  market_analysis JSONB,
  comprehensive_summary JSONB,
  predicted_yield NUMERIC,
  actual_yield NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.comprehensive_plans ENABLE ROW LEVEL SECURITY;

-- Comprehensive plans RLS Policies
CREATE POLICY "Users can view their own comprehensive plans"
  ON public.comprehensive_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comprehensive plans"
  ON public.comprehensive_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comprehensive plans"
  ON public.comprehensive_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comprehensive plans"
  ON public.comprehensive_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for farms updated_at
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for comprehensive_plans updated_at
CREATE TRIGGER update_comprehensive_plans_updated_at
    BEFORE UPDATE ON public.comprehensive_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();