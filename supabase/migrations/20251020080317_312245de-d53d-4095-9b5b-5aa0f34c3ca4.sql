-- Create table for agricultural experts
CREATE TABLE IF NOT EXISTS public.agricultural_experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agricultural_experts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view experts
CREATE POLICY "Anyone can view experts"
ON public.agricultural_experts
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert/update/delete (admin check should be added later)
CREATE POLICY "Authenticated users can manage experts"
ON public.agricultural_experts
FOR ALL
USING (auth.role() = 'authenticated');

-- Update agricultural_resources table to support file uploads and deletions
ALTER TABLE public.agricultural_resources
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Add policy for authenticated users to upload PDFs
CREATE POLICY "Authenticated users can upload resources"
ON public.agricultural_resources
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add policy for users to delete their own resources
CREATE POLICY "Users can delete their own resources"
ON public.agricultural_resources
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agricultural_experts_updated_at
BEFORE UPDATE ON public.agricultural_experts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create table for agricultural news (AI-generated)
CREATE TABLE IF NOT EXISTS public.agricultural_news_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  location TEXT,
  category TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agricultural_news_feed ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view news
CREATE POLICY "Anyone can view news feed"
ON public.agricultural_news_feed
FOR SELECT
USING (true);