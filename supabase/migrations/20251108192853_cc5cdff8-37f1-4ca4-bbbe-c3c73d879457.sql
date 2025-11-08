-- Update the user_has_consultation_with_expert function to only check for accepted consultations
-- This prevents users from accessing expert contact info immediately after creating a consultation request
CREATE OR REPLACE FUNCTION public.user_has_consultation_with_expert(_user_id uuid, _expert_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.expert_consultations
    WHERE user_id = _user_id
      AND expert_id = _expert_id
      AND status = 'accepted'  -- Only accepted consultations, not pending
  )
$function$;