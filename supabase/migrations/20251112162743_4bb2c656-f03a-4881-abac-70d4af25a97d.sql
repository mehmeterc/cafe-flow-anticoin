-- Rename type to transaction_type in anticoin_transactions
alter table public.anticoin_transactions
  rename column type to transaction_type;

-- Add blockchain_tx_id column to anticoin_transactions  
alter table public.anticoin_transactions
  add column blockchain_tx_id text;

-- Change power_outlets to boolean type
alter table public.cafes
  drop column power_outlets;
  
alter table public.cafes
  add column power_outlets boolean default true;

-- Create sponsors table
create table public.sponsors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text not null,
  description text,
  website_url text,
  tier text check (tier in ('platinum', 'gold', 'silver', 'bronze')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on sponsors
alter table public.sponsors enable row level security;

-- Create policy for sponsors (public read)
create policy "Anyone can view sponsors"
  on public.sponsors for select
  using (true);

-- Add trigger for sponsors updated_at
create trigger update_sponsors_updated_at
  before update on public.sponsors
  for each row
  execute function public.update_updated_at_column();