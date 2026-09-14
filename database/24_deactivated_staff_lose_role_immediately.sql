-- ============================================================================
-- Deactivated staff should lose role-based access immediately, not just
-- once their access token happens to expire/refresh.
--
-- current_staff_role() (and therefore is_secretary(), and the
-- teams_scoped_staff policy that calls it directly) only checked the row's
-- `role` column, ignoring `is_active`. app/api/staff/update/route.ts
-- deactivates someone by banning their Supabase Auth user, but a
-- still-valid access token they're already holding keeps working at the
-- RLS layer until it naturally expires, since RLS re-evaluates these
-- functions on every request using whatever auth.uid() the token carries —
-- banning the auth user doesn't revoke tokens already issued.
-- ============================================================================

create or replace function current_staff_role()
returns user_role as $$
  select role from staff_profiles where id = auth.uid() and is_active;
$$ language sql stable security definer;
