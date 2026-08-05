-- ============================================================================
-- FIX: the `sectors` table was created in 01_schema.sql but RLS was never
-- enabled on it and no policy was ever added — unlike every other table.
-- On a live Supabase project this silently blocks reads for everyone,
-- including the Secretary, which is why "Innovations by Sector" rendered
-- completely empty (the query returned zero rows, not an error).
-- ============================================================================

alter table sectors enable row level security;

-- Sectors are reference data (not sensitive) — anyone signed in, and the
-- public registration form itself, needs to read the sector list.
create policy sectors_read_all on sectors
  for select using (true);

-- Only the Secretary can change sector definitions.
create policy sectors_secretary_write on sectors
  for all using (is_secretary());
