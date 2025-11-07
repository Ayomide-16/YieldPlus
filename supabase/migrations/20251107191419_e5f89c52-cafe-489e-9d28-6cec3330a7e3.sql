-- Fix security issue: Protect expert contact information from public access
DROP POLICY IF EXISTS "Anyone can view experts" ON public.agricultural_experts;

-- Only authenticated users can view expert contact information
CREATE POLICY "Authenticated users can view experts"
ON public.agricultural_experts
FOR SELECT
TO authenticated
USING (true);