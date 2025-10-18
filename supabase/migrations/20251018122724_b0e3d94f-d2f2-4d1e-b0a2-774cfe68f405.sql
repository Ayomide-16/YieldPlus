-- Create pest and disease reports table
CREATE TABLE IF NOT EXISTS public.pest_disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  diagnosis JSONB,
  treatment_recommendations JSONB,
  images TEXT[],
  location JSONB,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agricultural resources table for PDFs
CREATE TABLE IF NOT EXISTS public.agricultural_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news feed table
CREATE TABLE IF NOT EXISTS public.agricultural_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  location JSONB,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expert consultations table
CREATE TABLE IF NOT EXISTS public.expert_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed')),
  expert_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add planting date preferences to comprehensive plans
ALTER TABLE public.comprehensive_plans 
ADD COLUMN IF NOT EXISTS preferred_planting_date DATE,
ADD COLUMN IF NOT EXISTS climate_data JSONB,
ADD COLUMN IF NOT EXISTS optimal_planting_window JSONB;

-- Enable RLS
ALTER TABLE public.pest_disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pest_disease_reports
CREATE POLICY "Users can view their own pest reports"
  ON public.pest_disease_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pest reports"
  ON public.pest_disease_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pest reports"
  ON public.pest_disease_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pest reports"
  ON public.pest_disease_reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for agricultural_resources (public read)
CREATE POLICY "Anyone can view resources"
  ON public.agricultural_resources FOR SELECT
  USING (true);

-- RLS Policies for agricultural_news (public read)
CREATE POLICY "Anyone can view news"
  ON public.agricultural_news FOR SELECT
  USING (true);

-- RLS Policies for expert_consultations
CREATE POLICY "Users can view their own consultations"
  ON public.expert_consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consultations"
  ON public.expert_consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultations"
  ON public.expert_consultations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_pest_disease_reports_updated_at
  BEFORE UPDATE ON public.pest_disease_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agricultural_resources_updated_at
  BEFORE UPDATE ON public.agricultural_resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_expert_consultations_updated_at
  BEFORE UPDATE ON public.expert_consultations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();