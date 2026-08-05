-- ============================================================================
-- REVERT project codes back to the official 2-digit format.
-- Run this in the Supabase SQL Editor against your LIVE project — this
-- supersedes the 3-digit change made in 10_scale_fixes.sql.
--
-- Official format confirmed: [SECTOR PREFIX][YEAR][2-digit], e.g. ENV202601.
-- Cap is 99 registrations per sector per year — do not change the padding.
-- ============================================================================

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

  if v_next > 99 then
    raise exception
      'Sector % has exceeded 99 registrations for %. This sector is at the official format''s limit — contact the dev team before this happens again.',
      v_prefix, v_year;
  end if;

  v_code := v_prefix || v_year::text || lpad(v_next::text, 2, '0');
  new.project_code := v_code;

  return new;
end;
$$ language plpgsql;
