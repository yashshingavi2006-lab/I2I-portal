-- ============================================================================
-- PHASE 3 — WEEKLY DEVELOPMENT TARGETS
--
-- A forward-looking planning companion to the existing daily timeline log
-- (timeline_entries, which records what was actually done each day). This
-- table holds one free-text plan per week, for a fixed 8-week window
-- (December-January) that the UI renders alongside a reference calendar.
-- The date range per week_number is defined in code (lib/constants.ts),
-- not duplicated here — this table only stores which week and what text.
-- ============================================================================

create table weekly_targets (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  week_number int not null check (week_number between 1 and 8),
  target_text text,
  updated_at timestamptz not null default now(),
  unique (team_id, week_number)
);

create index idx_weekly_targets_team on weekly_targets(team_id);

alter table weekly_targets enable row level security;

-- Same visibility rule as the daily timeline: leader, assigned mentor/
-- ambassador, and secretary.
create policy weekly_targets_visible_to_team on weekly_targets
  for select using (is_team_member_or_staff(team_id));

-- Leader can log their own team's plan, and edit it — but same lock rule as
-- the daily timeline: no edits once the Secretary has locked the team.
create policy weekly_targets_leader_write on weekly_targets
  for insert with check (
    exists (select 1 from teams where id = team_id and leader_auth_id = auth.uid())
  );

create policy weekly_targets_leader_update on weekly_targets
  for update using (
    exists (
      select 1 from teams
      where id = team_id and leader_auth_id = auth.uid() and timeline_locked = false
    )
    or is_secretary()
  );
