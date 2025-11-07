-- Fix admin authorization on agricultural_experts table
DROP POLICY IF EXISTS "Authenticated users can manage experts" ON agricultural_experts;

CREATE POLICY "Only admins can manage experts" 
ON agricultural_experts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep the existing read policy for everyone
-- The "Anyone can view experts" policy already exists and is correct