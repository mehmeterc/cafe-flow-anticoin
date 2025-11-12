-- Change noise_level to integer type (1-5 scale)
alter table public.cafes
  drop constraint if exists cafes_noise_level_check;

alter table public.cafes
  alter column noise_level type integer using 
    case 
      when noise_level = 'quiet' then 1
      when noise_level = 'moderate' then 3
      when noise_level = 'lively' then 5
      else 3
    end;

alter table public.cafes
  add constraint cafes_noise_level_check check (noise_level between 1 and 5);