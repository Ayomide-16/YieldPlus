-- Create data_sync_history table to track NBS data updates
CREATE TABLE IF NOT EXISTS public.data_sync_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL DEFAULT 'nbs_market_prices',
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  records_processed INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  dataset_source_url TEXT,
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('manual', 'cron', 'system')),
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_sync_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view sync history
CREATE POLICY "Admins can view sync history"
  ON public.data_sync_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert sync records
CREATE POLICY "Admins can insert sync history"
  ON public.data_sync_history
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_data_sync_history_status ON public.data_sync_history(status);
CREATE INDEX idx_data_sync_history_started_at ON public.data_sync_history(started_at DESC);