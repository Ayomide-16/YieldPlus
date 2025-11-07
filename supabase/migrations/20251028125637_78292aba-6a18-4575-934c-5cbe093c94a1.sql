-- Create blockchain-related tables for Hedera integration

-- Farm assets tokenization (RWA)
CREATE TABLE public.tokenized_farm_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'land', 'equipment', 'harvest', 'livestock'
  asset_name TEXT NOT NULL,
  description TEXT,
  total_value NUMERIC NOT NULL,
  token_id TEXT, -- Hedera token ID
  total_supply NUMERIC NOT NULL,
  available_supply NUMERIC NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'tokenized', 'active', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supply chain tracking
CREATE TABLE public.supply_chain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id),
  crop_type TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  current_stage TEXT NOT NULL, -- 'planting', 'growing', 'harvesting', 'processing', 'transport', 'market'
  location JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  hedera_transaction_id TEXT,
  hedera_topic_id TEXT,
  metadata JSONB, -- fertilizers used, treatments, certifications, etc.
  previous_record_id UUID REFERENCES public.supply_chain_records(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart contract payment agreements
CREATE TABLE public.payment_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id),
  contract_type TEXT NOT NULL, -- 'yield_based', 'delivery', 'insurance', 'escrow'
  parties JSONB NOT NULL, -- buyer, seller, escrow details
  terms JSONB NOT NULL, -- payment terms, conditions, triggers
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'HBAR',
  hedera_contract_id TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'triggered', 'completed', 'cancelled'
  trigger_conditions JSONB,
  execution_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farm data registry (on-chain records)
CREATE TABLE public.farm_data_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id),
  record_type TEXT NOT NULL, -- 'soil_analysis', 'climate_data', 'harvest_record', 'certification', 'practice'
  data_hash TEXT NOT NULL, -- Hash of the actual data
  hedera_file_id TEXT, -- Hedera File Service ID
  hedera_transaction_id TEXT,
  data_summary JSONB, -- Summary/preview of the data
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'disputed'
  visibility TEXT DEFAULT 'private', -- 'private', 'public', 'certified_only'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agricultural NFT certificates
CREATE TABLE public.agricultural_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id),
  nft_type TEXT NOT NULL, -- 'organic_certification', 'quality_badge', 'training_certificate', 'achievement'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB, -- Certification details, issuer, validity period
  hedera_token_id TEXT,
  hedera_serial_number BIGINT,
  image_url TEXT,
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  issuer TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User wallet connections
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  hedera_account_id TEXT,
  public_key TEXT,
  wallet_type TEXT, -- 'hashpack', 'blade', 'kabila'
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tokenized_farm_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_data_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tokenized_farm_assets
CREATE POLICY "Users can view their own tokenized assets"
  ON public.tokenized_farm_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tokenized assets"
  ON public.tokenized_farm_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokenized assets"
  ON public.tokenized_farm_assets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for supply_chain_records
CREATE POLICY "Users can view their own supply chain records"
  ON public.supply_chain_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supply chain records"
  ON public.supply_chain_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_contracts
CREATE POLICY "Users can view their own payment contracts"
  ON public.payment_contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment contracts"
  ON public.payment_contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment contracts"
  ON public.payment_contracts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for farm_data_registry
CREATE POLICY "Users can view their own farm data"
  ON public.farm_data_registry FOR SELECT
  USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY "Users can create their own farm data"
  ON public.farm_data_registry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm data"
  ON public.farm_data_registry FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for agricultural_nfts
CREATE POLICY "Users can view their own NFTs"
  ON public.agricultural_nfts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NFTs"
  ON public.agricultural_nfts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_wallets
CREATE POLICY "Users can view their own wallet"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wallet"
  ON public.user_wallets FOR ALL
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_tokenized_assets_user ON public.tokenized_farm_assets(user_id);
CREATE INDEX idx_tokenized_assets_farm ON public.tokenized_farm_assets(farm_id);
CREATE INDEX idx_supply_chain_user ON public.supply_chain_records(user_id);
CREATE INDEX idx_supply_chain_batch ON public.supply_chain_records(batch_id);
CREATE INDEX idx_payment_contracts_user ON public.payment_contracts(user_id);
CREATE INDEX idx_farm_data_user ON public.farm_data_registry(user_id);
CREATE INDEX idx_nfts_user ON public.agricultural_nfts(user_id);

-- Add update triggers
CREATE TRIGGER update_tokenized_assets_updated_at
  BEFORE UPDATE ON public.tokenized_farm_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payment_contracts_updated_at
  BEFORE UPDATE ON public.payment_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_farm_data_registry_updated_at
  BEFORE UPDATE ON public.farm_data_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();