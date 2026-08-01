-- ============================================================================
-- PROJECT CODE AUTO-GENERATION
-- Format: [SECTOR PREFIX][YEAR][2-digit sequential, resets each year per sector]
-- e.g. ENV202601, ENV202602 ... ENV202699
-- ============================================================================

create or replace function generate_project_code()
returns trigger as $$
declare
  v_prefix text;
  v_year int;
  v_next int;
  v_code text;
begin
  -- Only generate once, on insert, and only if not already set
  if new.project_code is not null then
    return new;
  end if;

  select prefix into v_prefix from sectors where id = new.sector_id;
  if v_prefix is null then
    raise exception 'Invalid sector_id: no matching sector found';
  end if;

  v_year := new.registration_year;

  -- Atomically increment the per-sector, per-year counter.
  -- Uses upsert + row lock to prevent two simultaneous registrations
  -- in the same sector from getting the same number.
  insert into project_code_counters (sector_id, year, last_number)
  values (new.sector_id, v_year, 1)
  on conflict (sector_id, year)
  do update set last_number = project_code_counters.last_number + 1
  returning last_number into v_next;

  if v_next > 99 then
    raise exception
      'Sector % has exceeded 99 registrations for %. Bump padding to 3 digits in generate_project_code().',
      v_prefix, v_year;
  end if;

  v_code := v_prefix || v_year::text || lpad(v_next::text, 2, '0');
  new.project_code := v_code;

  return new;
end;
$$ language plpgsql;

create trigger trg_generate_project_code
  before insert on teams
  for each row
  execute function generate_project_code();


-- ============================================================================
-- HELPER: current staff member's role (used heavily in RLS policies)
-- ============================================================================
create or replace function current_staff_role()
returns user_role as $$
  select role from staff_profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_secretary()
returns boolean as $$
  select current_staff_role() = 'secretary';
$$ language sql stable security definer;
