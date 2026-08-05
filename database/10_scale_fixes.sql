-- ============================================================================
-- SCALE & RELIABILITY FIXES — run this once in the Supabase SQL Editor
-- against your LIVE project before Phase 1 registration opens.
-- (Editing the .sql files in this repo only affects future fresh installs —
-- it does NOT change a database that's already running. This script is
-- what actually updates the live one.)
-- ============================================================================

-- 1. Project codes: 2-digit → 3-digit padding (99 → 999 per sector per year).
--    At 800 registrations across 6 sectors, several sectors would have
--    hit the old 99 cap and started throwing errors mid-registration-day.
create or replace function generate_project_code()
returns trigger as $$
declare
  v_prefix text;
  v_year int;
  v_next int;
  v_code text;
begin
  if new.project_code is not null then
    return new;
  end if;

  select prefix into v_prefix from sectors where id = new.sector_id;
  if v_prefix is null then
    raise exception 'Invalid sector_id: no matching sector found';
  end if;

  v_year := new.registration_year;

  insert into project_code_counters (sector_id, year, last_number)
  values (new.sector_id, v_year, 1)
  on conflict (sector_id, year)
  do update set last_number = project_code_counters.last_number + 1
  returning last_number into v_next;

  if v_next > 999 then
    raise exception
      'Sector % has exceeded 999 registrations for %. Bump padding to 4 digits in generate_project_code().',
      v_prefix, v_year;
  end if;

  v_code := v_prefix || v_year::text || lpad(v_next::text, 3, '0');
  new.project_code := v_code;

  return new;
end;
$$ language plpgsql;

-- 2. Prevent duplicate registrations from the same person in the same year
--    (double-clicking submit, refreshing after a slow network response, etc).
--    Scoped to registration_year so the same email can register again in a
--    future season without being blocked.
create unique index if not exists teams_leader_email_year_unique
  on teams (lower(leader_email), registration_year);
