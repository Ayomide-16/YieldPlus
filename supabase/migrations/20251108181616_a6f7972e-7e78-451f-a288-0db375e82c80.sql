-- Add expert_id column to existing expert_consultations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'expert_consultations' 
    AND column_name = 'expert_id'
  ) THEN
    ALTER TABLE public.expert_consultations 
    ADD COLUMN expert_id UUID REFERENCES public.agricultural_experts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create function to check consultation access
CREATE OR REPLACE FUNCTION public.user_has_consultation_with_expert(
  _user_id UUID,
  _expert_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.expert_consultations
    WHERE user_id = _user_id
      AND expert_id = _expert_id
      AND status IN ('pending', 'accepted')
  )
$$;

-- Drop the overly permissive policy on agricultural_experts
DROP POLICY IF EXISTS "Authenticated users can view experts" ON public.agricultural_experts;

-- Create new basic info policy
CREATE POLICY "Users can view basic expert info"
ON public.agricultural_experts
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create view for public expert info (without contact details)
CREATE OR REPLACE VIEW public.experts_public_info AS
SELECT 
  id,
  name,
  specialization,
  location,
  created_at
FROM public.agricultural_experts;

-- Create function to get full expert details only when authorized
CREATE OR REPLACE FUNCTION public.get_expert_contact_info(_expert_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialization TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  whatsapp_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    specialization,
    location,
    phone,
    email,
    whatsapp_link,
    created_at
  FROM public.agricultural_experts
  WHERE id = _expert_id
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.user_has_consultation_with_expert(auth.uid(), _expert_id)
    );
$$;