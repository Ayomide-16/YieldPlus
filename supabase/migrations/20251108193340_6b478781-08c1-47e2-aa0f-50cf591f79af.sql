-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view basic expert info" ON public.agricultural_experts;

-- Create a security definer function to list experts with only basic info (no contact details)
CREATE OR REPLACE FUNCTION public.list_agricultural_experts()
RETURNS TABLE(
  id uuid,
  name text,
  specialization text,
  location text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id,
    name,
    specialization,
    location,
    created_at,
    updated_at
  FROM public.agricultural_experts
  ORDER BY name;
$function$;

-- Create a new restrictive SELECT policy that only allows access to full details for admins or users with accepted consultations
CREATE POLICY "Only admins and users with accepted consultations can view expert details"
ON public.agricultural_experts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR public.user_has_consultation_with_expert(auth.uid(), id)
);