-- ============================================================================
-- EXTENDED SCHEMA — built from the reference portal's screenshots.
-- Run after 07_phase2_automation.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Team members now have a role (e.g. "Software Developer", "AI/ML Engineer")
-- ----------------------------------------------------------------------------
alter table team_members add column if not exists role text;

-- ----------------------------------------------------------------------------
-- Teams: richer institute fields seen in the participant "Institute
-- Specification" card, plus daily-timeline config.
-- ----------------------------------------------------------------------------
alter table teams add column if not exists department text;
alter table teams add column if not exists district text;
alter table teams add column if not exists division text;
alter table teams add column if not exists timeline_target_meetings int not null default 9;
alter table teams add column if not exists timeline_locked boolean not null default false;

-- ----------------------------------------------------------------------------
-- Phase 2: "fast screening" is a separate first pass before the funding
-- decision itself (Pass/Reject buttons in the admin queue, distinct from
-- funding_status which is the later approve/reject/partial call).
-- ----------------------------------------------------------------------------
alter table phase2_applications add column if not exists screening_status text
  not null default 'pending' check (screening_status in ('pending', 'pass', 'reject'));

-- ----------------------------------------------------------------------------
-- PHASE 3 — Joint meeting evaluations.
-- Workflow: Ambassador raises a meeting + writes evaluation questions ->
-- Mentor grades each question (0-10) -> mentor_score is the calculated
-- average. Ambassador can also leave their own quick score/comment.
-- ----------------------------------------------------------------------------
create table meetings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  raised_by uuid not null references staff_profiles(id), -- the ambassador
  meeting_type text not null,      -- e.g. 'Meet 1', 'Meet 2', ...
  meeting_name text,
  meeting_date date not null,

  questions jsonb not null default '[]', -- array of question strings, written by the ambassador

  ambassador_score numeric(4,2),   -- ambassador's own quick score, optional
  ambassador_comment text,

  mentor_question_scores jsonb,    -- array of numbers (0-10), same order as `questions`
  mentor_score numeric(4,2),       -- calculated average of mentor_question_scores
  mentor_comment text,
  graded_by uuid references staff_profiles(id), -- the mentor who graded
  graded_at timestamptz,

  status text not null default 'awaiting_grading'
    check (status in ('awaiting_grading', 'completed')),

  created_at timestamptz not null default now()
);

create index idx_meetings_team on meetings(team_id);
create index idx_meetings_status on meetings(status);

-- Auto-calculate mentor_score as the average of mentor_question_scores
-- whenever a mentor submits their grading.
create or replace function calculate_mentor_score()
returns trigger as $$
declare
  v_scores jsonb;
  v_sum numeric := 0;
  v_count int := 0;
  v_item jsonb;
begin
  if new.mentor_question_scores is not null then
    v_scores := new.mentor_question_scores;
    for v_item in select * from jsonb_array_elements(v_scores) loop
      v_sum := v_sum + (v_item#>>'{}')::numeric;
      v_count := v_count + 1;
    end loop;
    if v_count > 0 then
      new.mentor_score := round(v_sum / v_count, 2);
    end if;
    new.status := 'completed';
    new.graded_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_calculate_mentor_score
  before update on meetings
  for each row
  when (new.mentor_question_scores is distinct from old.mentor_question_scores)
  execute function calculate_mentor_score();

-- ----------------------------------------------------------------------------
-- PHASE 3 — Structured milestone checklist per project
-- ----------------------------------------------------------------------------
create table milestones (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null,
  description text,
  is_done boolean not null default false,
  due_date date,
  created_by uuid references staff_profiles(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_milestones_team on milestones(team_id);

-- ----------------------------------------------------------------------------
-- PHASE 3 — Daily timeline: teams log mandatory progress per day during
-- the mentoring phase. "Add Meet" on a day links it to a meetings row.
-- ----------------------------------------------------------------------------
create table timeline_entries (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  entry_date date not null,
  work_description text,
  meeting_id uuid references meetings(id), -- set when "Add Meet" is used on this day
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, entry_date)
);

create index idx_timeline_team on timeline_entries(team_id);

create trigger trg_timeline_touch before update on timeline_entries
  for each row execute function touch_updated_at();

-- ----------------------------------------------------------------------------
-- Project discussion board — shared chat between team leader, mentor, and
-- ambassador for a given project.
-- ----------------------------------------------------------------------------
create table discussion_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  sender_auth_id uuid not null, -- references auth.users(id), either the leader or a staff member
  sender_name text not null,
  sender_role text not null, -- 'participant' | 'mentor' | 'ambassador' | 'secretary'
  message text not null,
  created_at timestamptz not null default now()
);

create index idx_discussion_team on discussion_messages(team_id, created_at);

-- ----------------------------------------------------------------------------
-- Edit requests — once a team's data is locked post-submission, the leader
-- can request permission to change something; Secretary approves/rejects.
-- ----------------------------------------------------------------------------
create table edit_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  requested_by uuid not null, -- the team leader's auth id
  section text not null,      -- e.g. 'team_info', 'project_details', 'timeline'
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references staff_profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

create index idx_edit_requests_status on edit_requests(status);

-- ----------------------------------------------------------------------------
-- PHASE 4 — Final evaluation & results
-- ----------------------------------------------------------------------------
create table phase4_submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references teams(id) on delete cascade,

  report_doc_url text,
  final_ppt_url text,
  demo_video_url text,

  jury_score numeric(5,2), -- out of 100
  result_award text default 'not_scored'
    check (result_award in ('not_scored', 'under_evaluation', 'completed', 'winner')),

  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_phase4_touch before update on phase4_submissions
  for each row execute function touch_updated_at();

-- ----------------------------------------------------------------------------
-- MANAGEMENT — Audit logs
-- ----------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,        -- staff_profiles.id, null for system/automated actions
  actor_name text not null,
  action text not null, -- e.g. 'login', 'status_change', 'funding_approved', 'bulk_eligible'
  target_type text,     -- e.g. 'team', 'phase2_application', 'meeting'
  target_id uuid,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_audit_logs_created on audit_logs(created_at desc);

-- ----------------------------------------------------------------------------
-- MANAGEMENT — Email templates (admin-editable, overrides the code defaults
-- in lib/notifications/templates.ts when a row exists for that type)
-- ----------------------------------------------------------------------------
create table email_templates (
  notification_type text primary key, -- matches notification_type enum values
  subject text not null,
  body text not null,
  updated_by uuid references staff_profiles(id),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- MANAGEMENT — Phase Engine: open/close control per phase, with optional
-- scheduled windows.
-- ----------------------------------------------------------------------------
create table phase_settings (
  phase_number int primary key check (phase_number between 1 and 4),
  phase_name text not null,
  is_open boolean not null default true,
  opens_at timestamptz,
  closes_at timestamptz,
  updated_by uuid references staff_profiles(id),
  updated_at timestamptz not null default now()
);

insert into phase_settings (phase_number, phase_name) values
  (1, 'Registration'),
  (2, 'Proposal & Funding'),
  (3, 'Development'),
  (4, 'Final Evaluation');

-- ----------------------------------------------------------------------------
-- Bulk action: "Make All Phase 1 Eligible" — reuses the existing
-- shortlisted_phase2 status + its existing auto-notification trigger
-- (see 07_phase2_automation.sql), so bulk-approving 50 teams also
-- auto-queues 50 notification pairs with zero extra code.
-- ----------------------------------------------------------------------------
create or replace function make_all_phase1_eligible()
returns int as $$
declare
  v_count int;
begin
  update teams set status = 'shortlisted_phase2'
  where status = 'registered';
  get diagnostics v_count = row_count;

  insert into audit_logs (actor_name, action, details)
  values ('Secretary', 'bulk_eligible', jsonb_build_object('teams_updated', v_count));

  return v_count;
end;
$$ language plpgsql security definer;
