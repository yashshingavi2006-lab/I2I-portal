-- ============================================================================
-- ROW-LEVEL SECURITY — this is what actually enforces "everyone sees
-- different things", at the database level (not just hidden in the UI).
-- ============================================================================

alter table teams enable row level security;
alter table team_members enable row level security;
alter table phase2_applications enable row level security;
alter table phase2_bill_items enable row level security;
alter table project_assignments enable row level security;
alter table staff_profiles enable row level security;
alter table access_scopes enable row level security;

-- ----------------------------------------------------------------------------
-- STAFF PROFILES: staff can read their own profile; secretary sees everyone
-- ----------------------------------------------------------------------------
create policy staff_read_own on staff_profiles
  for select using (id = auth.uid() or is_secretary());

create policy staff_secretary_manage on staff_profiles
  for all using (is_secretary());

-- ----------------------------------------------------------------------------
-- TEAMS
-- ----------------------------------------------------------------------------
-- Team leaders can see + edit their own registration
create policy teams_leader_own on teams
  for select using (leader_auth_id = auth.uid());

create policy teams_leader_update_own on teams
  for update using (leader_auth_id = auth.uid());

-- Anyone can INSERT a new registration (public sign-up flow) — no auth required
-- at insert time since the leader account is created in the same flow.
create policy teams_public_insert on teams
  for insert with check (true);

-- Secretary: full access to every team
create policy teams_secretary_all on teams
  for select using (is_secretary());

create policy teams_secretary_update on teams
  for update using (is_secretary());

-- Chief Ambassadors / Heads: access limited to their assigned scope
-- (sector-based, or all sectors if no scope row exists for them — Secretary
-- decides this by adding/removing rows in access_scopes)
create policy teams_scoped_staff on teams
  for select using (
    current_staff_role() in ('chief_ambassador','head')
    and (
      exists (
        select 1 from access_scopes
        where staff_id = auth.uid() and sector_id = teams.sector_id
      )
      or not exists (
        select 1 from access_scopes where staff_id = auth.uid()
      )
    )
  );

-- Ambassadors / Mentors: only teams explicitly assigned to them
create policy teams_assigned_staff on teams
  for select using (
    exists (
      select 1 from project_assignments
      where team_id = teams.id and staff_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- TEAM MEMBERS: inherits visibility from the parent team
-- ----------------------------------------------------------------------------
create policy team_members_via_team on team_members
  for select using (
    exists (
      select 1 from teams t where t.id = team_members.team_id
      and (
        t.leader_auth_id = auth.uid()
        or is_secretary()
        or exists (
          select 1 from project_assignments pa
          where pa.team_id = t.id and pa.staff_id = auth.uid()
        )
      )
    )
  );

create policy team_members_leader_insert on team_members
  for insert with check (true); -- inserted during public registration flow

-- ----------------------------------------------------------------------------
-- PHASE 2 APPLICATIONS: sensitive (bank details) — tighter access.
-- Mentors should NOT see bank details per the original spec, only Secretary,
-- the team leader themself, and (optionally) whoever handles funding ops.
-- ----------------------------------------------------------------------------
create policy phase2_leader_own on phase2_applications
  for select using (
    exists (select 1 from teams t where t.id = team_id and t.leader_auth_id = auth.uid())
  );

create policy phase2_leader_update_own on phase2_applications
  for update using (
    exists (select 1 from teams t where t.id = team_id and t.leader_auth_id = auth.uid())
  );

create policy phase2_leader_insert on phase2_applications
  for insert with check (
    exists (select 1 from teams t where t.id = team_id and t.leader_auth_id = auth.uid())
  );

create policy phase2_secretary_all on phase2_applications
  for all using (is_secretary());

-- Ambassadors assigned to the project can see pitch/funding status, but a
-- separate, narrower view (without bank fields) should be used in the UI
-- layer for them — RLS gates the row, the API layer should select specific
-- columns for non-secretary roles. See lib/queries/phase2.ts.
create policy phase2_assigned_ambassador on phase2_applications
  for select using (
    exists (
      select 1 from project_assignments pa
      where pa.team_id = phase2_applications.team_id
      and pa.staff_id = auth.uid()
      and pa.assignment_role = 'ambassador'
    )
  );

create policy phase2_bills_via_application on phase2_bill_items
  for select using (
    exists (
      select 1 from phase2_applications pa2
      join teams t on t.id = pa2.team_id
      where pa2.id = application_id
      and (t.leader_auth_id = auth.uid() or is_secretary())
    )
  );

create policy phase2_bills_leader_insert on phase2_bill_items
  for insert with check (
    exists (
      select 1 from phase2_applications pa2
      join teams t on t.id = pa2.team_id
      where pa2.id = application_id and t.leader_auth_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- PROJECT ASSIGNMENTS: staff can see their own assignments; secretary manages all
-- ----------------------------------------------------------------------------
create policy assignments_own on project_assignments
  for select using (staff_id = auth.uid());

create policy assignments_secretary_manage on project_assignments
  for all using (is_secretary());

-- ----------------------------------------------------------------------------
-- ACCESS SCOPES: only secretary manages these
-- ----------------------------------------------------------------------------
create policy access_scopes_secretary on access_scopes
  for all using (is_secretary());
