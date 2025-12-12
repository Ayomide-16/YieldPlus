-- ================================================
-- YieldPlus Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- PROFILES TABLE (extends auth.users)
-- ================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- FARMS TABLE
-- ================================================
create table if not exists public.farms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  location jsonb,
  size numeric,
  size_unit text default 'hectares',
  soil_type text,
  crops text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- SAVED PLANS TABLE
-- ================================================
create table if not exists public.saved_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_type text not null,
  plan_name text not null,
  plan_data jsonb not null,
  location jsonb,
  created_at timestamptz default now()
);

-- ================================================
-- COMPREHENSIVE PLANS TABLE
-- ================================================
create table if not exists public.comprehensive_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_data jsonb not null,
  location jsonb,
  farm_size numeric,
  created_at timestamptz default now()
);

-- ================================================
-- MARKET PRICES TABLE
-- ================================================
create table if not exists public.market_prices (
  id uuid default uuid_generate_v4() primary key,
  crop_name text not null,
  state text not null,
  market_name text,
  price numeric not null,
  unit text default 'per kg',
  source text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ================================================
-- AGRICULTURAL NEWS TABLE
-- ================================================
create table if not exists public.agricultural_news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text,
  source text,
  url text,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.saved_plans enable row level security;
alter table public.comprehensive_plans enable row level security;
alter table public.market_prices enable row level security;
alter table public.agricultural_news enable row level security;

-- ================================================
-- RLS POLICIES FOR PROFILES
-- ================================================
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- ================================================
-- RLS POLICIES FOR FARMS
-- ================================================
create policy "Users can view own farms" 
  on public.farms for select 
  using (auth.uid() = user_id);

create policy "Users can create farms" 
  on public.farms for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own farms" 
  on public.farms for update 
  using (auth.uid() = user_id);

create policy "Users can delete own farms" 
  on public.farms for delete 
  using (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES FOR SAVED PLANS
-- ================================================
create policy "Users can view own plans" 
  on public.saved_plans for select 
  using (auth.uid() = user_id);

create policy "Users can create plans" 
  on public.saved_plans for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own plans" 
  on public.saved_plans for delete 
  using (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES FOR COMPREHENSIVE PLANS
-- ================================================
create policy "Users can view own comprehensive plans" 
  on public.comprehensive_plans for select 
  using (auth.uid() = user_id);

create policy "Users can create comprehensive plans" 
  on public.comprehensive_plans for insert 
  with check (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES FOR MARKET PRICES (Public Read)
-- ================================================
create policy "Anyone can view market prices" 
  on public.market_prices for select 
  using (true);

-- ================================================
-- RLS POLICIES FOR AGRICULTURAL NEWS (Public Read)
-- ================================================
create policy "Anyone can view agricultural news" 
  on public.agricultural_news for select 
  using (true);

-- ================================================
-- CREATE PROFILE ON USER SIGNUP (Trigger)
-- ================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
select 'YieldPlus database schema created successfully!' as status;
