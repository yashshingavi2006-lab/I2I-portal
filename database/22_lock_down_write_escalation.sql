-- ============================================================================
-- LOCK DOWN WRITE-ESCALATION PATHS FOUND IN A SECURITY AUDIT
--
-- RLS policies here gate *which rows* a user can touch, but several
-- update/insert policies never restricted *which columns* — so "team
-- leader can edit their own team" also meant "team leader can set their
-- own team's status to funded, or their own phase2_applications
-- funding_status to approved, directly via the Supabase client/REST API
-- with their own session — completely bypassing every review flow the
-- Next.js app's own UI enforces." The app itself never does this, but
-- nothing at the database layer stopped a user from calling the API
-- directly.
--
-- Run this after 21_fix_audit_logs_insert_policy.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Pre-existing latent bug this fix would otherwise trip over: teams'
--    own SELECT policy (teams_assigned_staff, 03_rls_policies.sql) queries
--    project_assignments, and project_assignments' own SELECT policy
--    (assignments_team_leader_read, 18_fix_project_assignments_leader_read.sql)
--    queries teams right back — mutual recursion. This was never hit in
--    practice because a leader's own row always matched
--    teams_leader_update_own first, short-circuiting before Postgres ever
--    had to evaluate teams_assigned_staff's subquery. Dropping that policy
--    below removes the short-circuit and would otherwise turn every
--    leader's own read/update of their team into "infinite recursion
--    detected in policy for relation teams." Fix: move the
--    project_assignments check into a security-definer helper (same
--    pattern as is_secretary()/is_phase2_reviewer already use), which
--    bypasses RLS internally and so never re-enters teams' policies.
-- ----------------------------------------------------------------------------
create or replace function is_assigned_to_team(p_team_id uuid)
returns boolean as $$
  select exists (
    select 1 from project_assignments
    where team_id = p_team_id and staff_id = auth.uid()
  );
$$ language sql stable security definer;

drop policy if exists teams_assigned_staff on teams;
create policy teams_assigned_staff on teams
  for select using (is_assigned_to_team(id));

-- ----------------------------------------------------------------------------
-- 1. Policies with no legitimate caller — removing them removes the whole
--    escalation path with zero functionality loss:
--      - teams_leader_update_own: grep confirms no client code anywhere
--        updates `teams` as the leader; team-detail edits go through the
--        edit_requests approval flow instead.
--      - teams_public_insert / team_members_leader_insert: grep confirms
--        registration (app/api/register) and the Phase 1 bulk-import both
--        insert via the service-role admin client, never as an
--        authenticated user. These "with check (true)" policies let
--        anyone — authenticated or not — insert arbitrary team/member
--        rows directly, serving no code path today.
-- ----------------------------------------------------------------------------
drop policy if exists teams_leader_update_own on teams;
drop policy if exists teams_public_insert on teams;
drop policy if exists team_members_leader_insert on team_members;

-- ----------------------------------------------------------------------------
-- 2. teams: the only remaining non-Secretary write path is the delegated
--    Phase 2 reviewer (teams_phase2_reviewer_update), who legitimately
--    needs to advance `status` and nothing else.
-- ----------------------------------------------------------------------------
create or replace function enforce_teams_reviewer_column_guard()
returns trigger as $$
begin
  -- The service role (admin client — auth.uid() is null outside a user
  -- session) and Secretary are fully trusted and skip this guard entirely.
  if auth.uid() is null or is_secretary() then
    return new;
  end if;

  if is_phase2_reviewer(old.id) then
    if (to_jsonb(new) - 'status' - 'updated_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at') then
      raise exception 'Delegated reviewers may only change a team''s status.';
    end if;
    return new;
  end if;

  -- No remaining policy should let anything else reach here — fail loudly
  -- rather than silently if one somehow does.
  raise exception 'Not authorized to modify this team.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_teams_reviewer_column_guard on teams;
create trigger trg_teams_reviewer_column_guard
  before update on teams
  for each row execute function enforce_teams_reviewer_column_guard();

-- ----------------------------------------------------------------------------
-- 3. phase2_applications: team leaders may only write the fields their own
--    workspace form actually collects (components/participant/workspace-tab.tsx)
--    — uploads, bank/PAN details, mentor request, submitted_at. Delegated
--    reviewers may only write the 3 decision fields. Everything else
--    (funding_status, amount_approved, screening_status, and the unused
--    legacy amount_requested/pitch_summary/pitch_video_url/
--    research_paper_url/declaration_confirmed) must stay at its prior
--    value on UPDATE, or its schema default on INSERT.
-- ----------------------------------------------------------------------------
create or replace function enforce_phase2_column_guard()
returns trigger as $$
declare
  is_owner boolean;
  is_reviewer boolean;
begin
  if auth.uid() is null or is_secretary() then
    return new;
  end if;

  is_owner := exists (select 1 from teams where id = new.team_id and leader_auth_id = auth.uid());
  is_reviewer := is_phase2_reviewer(new.team_id);

  if is_reviewer and not is_owner then
    if TG_OP = 'UPDATE' and
       (to_jsonb(new) - 'screening_status' - 'funding_status' - 'amount_approved' - 'updated_at')
       is distinct from
       (to_jsonb(old) - 'screening_status' - 'funding_status' - 'amount_approved' - 'updated_at')
    then
      raise exception 'Reviewers may only update the screening and funding decision fields.';
    end if;
    return new;
  end if;

  if is_owner then
    if TG_OP = 'UPDATE' then
      if (to_jsonb(new) - 'pitch_deck_url' - 'funding_requested' - 'other_documents'
            - 'bills_doc_url' - 'passbook_doc_url' - 'pan_doc_url' - 'submitted_at'
            - 'bank_account_holder' - 'bank_account_number' - 'bank_ifsc' - 'bank_name'
            - 'pan_number' - 'mentor_requested' - 'updated_at')
          is distinct from
          (to_jsonb(old) - 'pitch_deck_url' - 'funding_requested' - 'other_documents'
            - 'bills_doc_url' - 'passbook_doc_url' - 'pan_doc_url' - 'submitted_at'
            - 'bank_account_holder' - 'bank_account_number' - 'bank_ifsc' - 'bank_name'
            - 'pan_number' - 'mentor_requested' - 'updated_at')
      then
        raise exception 'You can only update your own submission fields, not review/funding decisions.';
      end if;
    else
      if new.funding_status is distinct from 'under_review'
         or new.amount_approved is not null
         or new.screening_status is distinct from 'pending'
      then
        raise exception 'You can only update your own submission fields, not review/funding decisions.';
      end if;
    end if;
    return new;
  end if;

  raise exception 'Not authorized to modify this application.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_phase2_column_guard on phase2_applications;
create trigger trg_phase2_column_guard
  before insert or update on phase2_applications
  for each row execute function enforce_phase2_column_guard();

-- ----------------------------------------------------------------------------
-- 4. phase4_submissions: team leaders may only write their own upload
--    links + submitted_at; jury_score / result_award stay staff-only.
-- ----------------------------------------------------------------------------
create or replace function enforce_phase4_column_guard()
returns trigger as $$
begin
  if auth.uid() is null or is_secretary() then
    return new;
  end if;

  if not exists (select 1 from teams where id = new.team_id and leader_auth_id = auth.uid()) then
    raise exception 'Not authorized to modify this submission.';
  end if;

  if TG_OP = 'UPDATE' then
    if (to_jsonb(new) - 'report_doc_url' - 'final_ppt_url' - 'demo_video_url' - 'submitted_at' - 'updated_at')
        is distinct from
       (to_jsonb(old) - 'report_doc_url' - 'final_ppt_url' - 'demo_video_url' - 'submitted_at' - 'updated_at')
    then
      raise exception 'You can only update your own submission links, not scoring/results.';
    end if;
  else
    if new.jury_score is not null or new.result_award is distinct from 'not_scored' then
      raise exception 'You can only update your own submission links, not scoring/results.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_phase4_column_guard on phase4_submissions;
create trigger trg_phase4_column_guard
  before insert or update on phase4_submissions
  for each row execute function enforce_phase4_column_guard();

-- ----------------------------------------------------------------------------
-- 5. audit_logs: a staff member can log an action, but only ever as
--    themself — 21_fix_audit_logs_insert_policy.sql's check only verified
--    the caller was *some* staff member, not that actor_id matched who
--    they actually are, so any staff account could forge a log entry
--    attributed to anyone else.
-- ----------------------------------------------------------------------------
drop policy if exists audit_logs_staff_insert on audit_logs;
create policy audit_logs_staff_insert on audit_logs
  for insert with check (
    exists (select 1 from staff_profiles where id = auth.uid())
    and (actor_id = auth.uid() or actor_id is null)
  );
