-- Add hourly_cost as alias for hourly_rate (keep both for compatibility)
alter table public.cafes
  add column hourly_cost decimal(10, 2);

-- Update existing cafes to copy hourly_rate to hourly_cost
update public.cafes
set hourly_cost = hourly_rate
where hourly_cost is null;

-- Add remaining missing columns to cafes
alter table public.cafes
  add column seating_type text,
  add column open_hours text,
  add column tags text[];

-- Add remaining missing columns to events
alter table public.events
  add column seat_limit integer,
  add column organizer text,
  add column organizer_wallet text;

-- Add missing date column to bookings table
alter table public.bookings
  add column date date;