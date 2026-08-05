-- ============================================================================
-- PHASE 2 REVIEWER DELEGATION
--
-- With hundreds of Phase 2 submissions, the Secretary can't personally
-- screen every one. This lets the Secretary hand off specific projects to
-- specific Ambassadors/Chief Ambassadors, who then see exactly those
-- projects (and only those) in their own portal, with the same review
-- powers the Secretary has today: view pitch deck/bills/bank docs, fast
-- screening (pass/reject), and the funding decision (which also advances
-- teams.status, same as the Secretary's own review modal).
-- ============================================================================

create table phase2_reviewer_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  assigned_by uuid references staff_profiles(id),
  assigned_at timestamptz not null default now(),
  unique (team_id, staff_id)
);

create index idx_phase2_reviewer_staff on phase2_reviewer_assignments(staff_id);
create index idx_phase2_reviewer_team on phase2_reviewer_assignments(team_id);

alter table phase2_reviewer_assignments enable row level security;

create policy phase2_reviewer_assignments_secretary_manage on phase2_reviewer_assignments
  for all using (is_secretary());

create policy phase2_reviewer_assignments_own_read on phase2_reviewer_assignments
  for select using (staff_id = auth.uid());

-- Helper: is the current user a reviewer delegated to this team's Phase 2 app?
create or replace function is_phase2_reviewer(p_team_id uuid)
returns boolean as $$
  select exists (
    select 1 from phase2_reviewer_assignments
    where team_id = p_team_id and staff_id = auth.uid()
  );
$$ language sql stable security definer;

-- Reviewers need to see the team row itself (project code, name, college —
-- same fields the Secretary's queue shows) for their assigned projects.
create policy teams_phase2_reviewer_read on teams
  for select using (is_phase2_reviewer(id));

-- Reviewers act on Phase 2 the same way the Secretary does today: read
-- everything (bank/PAN included — verifying those is the point of the
-- review), and update screening_status / funding_status / amount_approved.
create policy phase2_reviewer_read on phase2_applications
  for select using (is_phase2_reviewer(team_id));

create policy phase2_reviewer_update on phase2_applications
  for update using (is_phase2_reviewer(team_id));

-- A reviewer's funding decision advances teams.status exactly like the
-- Secretary's review modal does (approved/partial -> shortlisted_phase3,
-- rejected -> rejected), so they need write access to that one column too.
create policy teams_phase2_reviewer_update on teams
  for update using (is_phase2_reviewer(id));
