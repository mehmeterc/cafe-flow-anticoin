-- Add missing columns to user_profiles
alter table public.user_profiles
  add column avatar_url text,
  add column bio text,
  add column work_style text,
  add column skills text[];

-- Add missing columns to cafes
alter table public.cafes
  add column owner_id uuid references public.user_profiles(id),
  add column location text,
  add column wifi_strength integer check (wifi_strength between 1 and 5),
  add column power_outlets integer,
  add column noise_level text check (noise_level in ('quiet', 'moderate', 'lively')),
  add column seating_capacity integer,
  add column rating decimal(3, 2) default 0;

-- Update cafes RLS to allow owners to manage their cafes
create policy "Cafe owners can update their cafes"
  on public.cafes for update
  using (auth.uid() = owner_id);

create policy "Cafe owners can insert cafes"
  on public.cafes for insert
  with check (auth.uid() = owner_id);

-- Add missing columns to events
alter table public.events
  add column date date,
  add column duration integer,
  add column price decimal(10, 2) default 0,
  add column anticoin_cost decimal(10, 2) default 0,
  add column location text,
  add column organizer_id uuid references public.user_profiles(id),
  add column is_featured boolean default false;