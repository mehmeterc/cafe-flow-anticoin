-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for transaction types
create type public.transaction_type as enum ('earn', 'spend', 'transfer');

-- Create enum for booking status
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- Create user_profiles table
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  wallet_address text,
  anticoin_balance decimal(10, 2) default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on user_profiles
alter table public.user_profiles enable row level security;

-- Create policies for user_profiles
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Create cafes table
create table public.cafes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  address text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  image_url text,
  hourly_rate decimal(10, 2) not null,
  coin_rate decimal(10, 2) default 10 not null,
  amenities text[],
  opening_hours jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on cafes
alter table public.cafes enable row level security;

-- Create policy for cafes (public read)
create policy "Anyone can view cafes"
  on public.cafes for select
  using (true);

-- Create bookings table
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  cafe_id uuid references public.cafes(id) on delete cascade not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  duration integer not null,
  total_cost decimal(10, 2) not null,
  status public.booking_status default 'pending' not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on bookings
alter table public.bookings enable row level security;

-- Create policies for bookings
create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can create their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Create checkins table
create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  cafe_id uuid references public.cafes(id) on delete cascade not null,
  start_time timestamp with time zone default now() not null,
  end_time timestamp with time zone,
  duration integer,
  cost decimal(10, 2),
  coins_earned decimal(10, 2),
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on checkins
alter table public.checkins enable row level security;

-- Create policies for checkins
create policy "Users can view their own checkins"
  on public.checkins for select
  using (auth.uid() = user_id);

create policy "Users can create their own checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checkins"
  on public.checkins for update
  using (auth.uid() = user_id);

-- Create favorites table
create table public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  cafe_id uuid references public.cafes(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, cafe_id)
);

-- Enable RLS on favorites
alter table public.favorites enable row level security;

-- Create policies for favorites
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can create their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Create events table
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid references public.cafes(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  image_url text,
  coin_reward decimal(10, 2) default 0,
  max_attendees integer,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on events
alter table public.events enable row level security;

-- Create policy for events (public read)
create policy "Anyone can view events"
  on public.events for select
  using (true);

-- Create event_attendees table
create table public.event_attendees (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  attended boolean default false,
  created_at timestamp with time zone default now() not null,
  unique(event_id, user_id)
);

-- Enable RLS on event_attendees
alter table public.event_attendees enable row level security;

-- Create policies for event_attendees
create policy "Users can view event attendees"
  on public.event_attendees for select
  using (true);

create policy "Users can register for events"
  on public.event_attendees for insert
  with check (auth.uid() = user_id);

create policy "Users can unregister from events"
  on public.event_attendees for delete
  using (auth.uid() = user_id);

-- Create anticoin_transactions table
create table public.anticoin_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  type public.transaction_type not null,
  description text,
  reference_id uuid,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on anticoin_transactions
alter table public.anticoin_transactions enable row level security;

-- Create policies for anticoin_transactions
create policy "Users can view their own transactions"
  on public.anticoin_transactions for select
  using (auth.uid() = user_id);

create policy "Users can create their own transactions"
  on public.anticoin_transactions for insert
  with check (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.update_updated_at_column();

create trigger update_cafes_updated_at
  before update on public.cafes
  for each row
  execute function public.update_updated_at_column();

create trigger update_bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.update_updated_at_column();

create trigger update_events_updated_at
  before update on public.events
  for each row
  execute function public.update_updated_at_column();

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();