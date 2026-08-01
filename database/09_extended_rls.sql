-- ============================================================================
-- RLS for extended schema tables. Run after 08_extended_schema.sql.
-- ============================================================================

alter table meetings enable row level security;
alter table milestones enable row level security;
alter table timeline_entries enable row level security;
alter table discussion_messages enable row level security;
alter table edit_requests enable row level security;
alter table phase4_submissions enable row level security;
alter table audit_logs enable row level security;
alter table email_templates enable row level security;
alter table phase_settings enable row level security;

-- Helper: is the current user the leader, mentor, or ambassador on this team?
create or replace function is_team_member_or_staff(p_team_id uuid)
returns boolean as $$
  select
    is_secretary()
    or exists (select 1 from teams where id = p_team_id and leader_auth_id = auth.uid())
    or exists (
      select 1 from project_assignments
      where team_id = p_team_id and staff_id = auth.uid()
    );
$$ language sql stable security definer;

-- ----------------------------------------------------------------------------
-- MEETINGS
-- ----------------------------------------------------------------------------
create policy meetings_visible_to_team on meetings
  for select using (is_team_member_or_staff(team_id));

create policy meetings_ambassador_insert on meetings
  for insert with check (
    exists (
      select 1 from project_assignments
      where team_id = meetings.team_id and staff_id = auth.uid() and assignment_role = 'ambassador'
    )
    or is_secretary()
  );

-- Mentor grades (update) only meetings for their assigned team
create policy meetings_mentor_grade on meetings
  for update using (
    exists (
      select 1 from project_assignments
      where team_id = meetings.team_id and staff_id = auth.uid() and assignment_role = 'mentor'
    )
    or is_secretary()
  );

-- ----------------------------------------------------------------------------
-- MILESTONES
-- ----------------------------------------------------------------------------
create policy milestones_visible_to_team on milestones
  for select using (is_team_member_or_staff(team_id));

create policy milestones_staff_manage on milestones
  for all using (
    exists (
      select 1 from project_assignments
      where team_id = milestones.team_id and staff_id = auth.uid()
    )
    or is_secretary()
  );

-- ----------------------------------------------------------------------------
-- TIMELINE ENTRIES — leader writes their own daily log; mentor/ambassador/
-- secretary can read.
-- ----------------------------------------------------------------------------
create policy timeline_visible_to_team on timeline_entries
  for select using (is_team_member_or_staff(team_id));

create policy timeline_leader_write on timeline_entries
  for insert with check (
    exists (select 1 from teams where id = team_id and leader_auth_id = auth.uid())
  );

create policy timeline_leader_update on timeline_entries
  for update using (
    exists (
      select 1 from teams
      where id = team_id and leader_auth_id = auth.uid() and timeline_locked = false
    )
    or is_secretary()
  );

-- ----------------------------------------------------------------------------
-- DISCUSSION MESSAGES — anyone on the team thread can read and post
-- ----------------------------------------------------------------------------
create policy discussion_visible_to_team on discussion_messages
  for select using (is_team_member_or_staff(team_id));

create policy discussion_team_post on discussion_messages
  for insert with check (is_team_member_or_staff(team_id));

-- ----------------------------------------------------------------------------
-- EDIT REQUESTS — leader creates for their own team; Secretary sees/reviews all
-- ----------------------------------------------------------------------------
create policy edit_requests_leader_own on edit_requests
  for select using (
    exists (select 1 from teams where id = team_id and leader_auth_id = auth.uid())
    or is_secretary()
  );

create policy edit_requests_leader_insert on edit_requests
  for insert with check (
    exists (select 1 from teams where id = team_id and leader_auth_id = auth.uid())
  );

create policy edit_requests_secretary_review on edit_requests
  for update using (is_secretary());

-- ----------------------------------------------------------------------------
-- PHASE 4 SUBMISSIONS
-- ----------------------------------------------------------------------------
create policy phase4_visible_to_team on phase4_submissions
  for select using (is_team_member_or_staff(team_id));

create policy phase4_leader_insert on phase4_submissions
  for insert with check (
    exists (select 1 from teams where id = team_id and leader_auth_id = auth.uid())
  );

create policy phase4_leader_update on phase4_submissions
  for update using (
    exists (select 1 from teams where id = team_id and leader_auth_id = auth.uid())
  );

create policy phase4_secretary_all on phase4_submissions
  for all using (is_secretary());

-- ----------------------------------------------------------------------------
-- AUDIT LOGS, EMAIL TEMPLATES, PHASE SETTINGS — Secretary only
-- ----------------------------------------------------------------------------
create policy audit_logs_secretary on audit_logs
  for select using (is_secretary());

create policy email_templates_secretary on email_templates
  for all using (is_secretary());

create policy phase_settings_read_all on phase_settings
  for select using (true); -- everyone can check if a phase is open

create policy phase_settings_secretary_write on phase_settings
  for update using (is_secretary());
