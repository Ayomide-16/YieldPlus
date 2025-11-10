-- Create market_prices table
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  outlet_type TEXT NOT NULL,
  sector TEXT NOT NULL,
  food_item TEXT NOT NULL,
  price_category TEXT NOT NULL,
  uprice NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_market_prices_date ON public.market_prices(date);
CREATE INDEX idx_market_prices_state ON public.market_prices(state);
CREATE INDEX idx_market_prices_food_item ON public.market_prices(food_item);
CREATE INDEX idx_market_prices_lga ON public.market_prices(lga);

-- Enable Row Level Security
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view market prices (public data)
CREATE POLICY "Anyone can view market prices"
ON public.market_prices
FOR SELECT
USING (true);

-- Only admins can insert market prices
CREATE POLICY "Only admins can insert market prices"
ON public.market_prices
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update market prices
CREATE POLICY "Only admins can update market prices"
ON public.market_prices
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete market prices
CREATE POLICY "Only admins can delete market prices"
ON public.market_prices
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));