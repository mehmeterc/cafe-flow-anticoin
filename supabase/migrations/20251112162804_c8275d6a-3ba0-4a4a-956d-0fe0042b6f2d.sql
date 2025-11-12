-- Change open_hours to jsonb type for structured data
alter table public.cafes
  alter column open_hours type jsonb using 
    case 
      when open_hours is null or open_hours = '' then '{}'::jsonb
      else ('"' || open_hours || '"')::jsonb
    end;