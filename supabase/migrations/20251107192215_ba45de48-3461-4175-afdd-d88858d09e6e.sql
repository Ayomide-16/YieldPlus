-- Fix all security issues

-- 1. Fix agricultural_experts to require authentication (not just anyone)
DROP POLICY IF EXISTS "Anyone can view experts" ON public.agricultural_experts;
DROP POLICY IF EXISTS "Authenticated users can view experts" ON public.agricultural_experts;

CREATE POLICY "Authenticated users can view experts"
ON public.agricultural_experts
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. Add UPDATE policy for agricultural_resources
CREATE POLICY "Users can update their own resources"
ON public.agricultural_resources
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Add DELETE policy for expert_consultations
CREATE POLICY "Users can delete their own consultations"
ON public.expert_consultations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Add DELETE policy for payment_contracts
CREATE POLICY "Users can delete their own payment contracts"
ON public.payment_contracts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Add UPDATE and DELETE policies for agricultural_nfts
CREATE POLICY "Users can update their own NFTs"
ON public.agricultural_nfts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFTs"
ON public.agricultural_nfts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Add UPDATE and DELETE policies for supply_chain_records
CREATE POLICY "Users can update their own supply chain records"
ON public.supply_chain_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supply chain records"
ON public.supply_chain_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Add UPDATE and DELETE policies for farm_data_registry
CREATE POLICY "Users can delete their own farm data"
ON public.farm_data_registry
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8. Add UPDATE and DELETE policies for tokenized_farm_assets
CREATE POLICY "Users can delete their own tokenized assets"
ON public.tokenized_farm_assets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);