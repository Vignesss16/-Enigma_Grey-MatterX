-- Genesis Reset FoodSafe: Clinical Decision Support Platform Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Patient Health Baselines)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  full_name text not null,
  patient_id text unique default 'CDS-8842',
  age integer,
  gender text,
  conditions jsonb not null default '[]'::jsonb,
  thresholds jsonb not null default '{"maxGlycemicLoadPerServing": 10, "maxSodiumMgPerServing": 400, "dailySodiumMgCeiling": 1500, "maxAddedSugarGrams": 0}'::jsonb,
  clinical_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Food Scans Table (Ingested & Evaluated Items)
create table if not exists public.food_scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  product_name text not null,
  brand text,
  category text,
  image_url text,
  barcode text,
  batch_number text,
  overall_status text check (overall_status in ('safe', 'caution', 'flagged')) not null,
  confidence_score numeric(5,2) default 98.00,
  hidden_polyols_grams numeric(5,2) default 0.00,
  nutrition jsonb not null,
  ingredients jsonb not null default '[]'::jsonb,
  clinical_flags jsonb not null default '[]'::jsonb,
  scanned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Swapped Alternatives Log (Safer Alternatives chosen)
create table if not exists public.swapped_alternatives (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  original_product text not null,
  replacement_product text not null,
  replacement_code text,
  compatibility_score numeric(5,2),
  swapped_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Row Level Security Policies
alter table public.profiles enable row level security;
alter table public.food_scans enable row level security;
alter table public.swapped_alternatives enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = user_id);

create policy "Users can view their own food scans" on public.food_scans
  for select using (auth.uid() = user_id);

create policy "Users can insert food scans" on public.food_scans
  for insert with check (auth.uid() = user_id);
