-- ============================================================================
-- Run this in the Supabase SQL Editor against your live project, after
-- 20_weekly_targets.sql.
--
-- In-app notification bell (top-right, all 4 portals) — separate from the
-- existing email/WhatsApp notification_queue, which stays as-is but isn't
-- relied on right now (nothing currently drains it on a schedule). This
-- table is what the bell in every portal actually reads.
--
-- Builds on top of the already-fixed after_assignment_created() from
-- 17_fix_assignment_notification_type_cast.sql (same pattern as that file
-- and 10_scale_fixes.sql before it: create-or-replace to update trigger
-- logic already live) — this migration does not touch or re-fix the enum
-- cast, it only adds an additional insert alongside the existing ones.
-- assignments_team_leader_read (18_fix_project_assignments_leader_read.sql)
-- already covers what a participant needs to read — nothing more needed
-- there.
-- ============================================================================

create table in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_auth_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text, -- portal path to navigate to on click, e.g. '/portal/participant'
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_in_app_notifications_recipient
  on in_app_notifications(recipient_auth_id, created_at desc);

alter table in_app_notifications enable row level security;

-- Recipients can read and mark-as-read their own notifications. There is
-- deliberately no insert/delete policy for regular users — rows are only
-- ever created by the security definer trigger functions below (or the
-- service role), never directly by a client.
create policy in_app_notifications_read_own on in_app_notifications
  for select using (recipient_auth_id = auth.uid());

create policy in_app_notifications_update_own on in_app_notifications
  for update using (recipient_auth_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Phase 2 shortlist -> team leader
-- ----------------------------------------------------------------------------
create or replace function notify_phase2_shortlist()
returns trigger as $$
begin
  if new.status = 'shortlisted_phase2' and old.status is distinct from 'shortlisted_phase2' then
    insert into notification_queue (type, channel, recipient_email, team_id, payload)
    values (
      'phase2_shortlisted', 'email', new.leader_email, new.id,
      jsonb_build_object('project_code', new.project_code, 'team_name', new.team_name)
    );
    insert into notification_queue (type, channel, recipient_phone, team_id, payload)
    values (
      'phase2_shortlisted', 'whatsapp', new.leader_phone, new.id,
      jsonb_build_object('project_code', new.project_code, 'team_name', new.team_name)
    );

    insert into in_app_notifications (recipient_auth_id, type, title, body, link)
    values (
      new.leader_auth_id,
      'phase2_shortlisted',
      'Shortlisted for Phase 2!',
      format('%s (%s) has been shortlisted. Complete your Phase 2 submission — pitch deck, bills, and bank details.', new.team_name, new.project_code),
      '/portal/participant'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- Phase 3 shortlist -> team leader
-- ----------------------------------------------------------------------------
create or replace function notify_phase3_shortlist()
returns trigger as $$
begin
  if new.status = 'shortlisted_phase3' and old.status is distinct from 'shortlisted_phase3' then
    insert into notification_queue (type, channel, recipient_email, team_id, payload)
    values (
      'phase3_shortlisted', 'email', new.leader_email, new.id,
      jsonb_build_object('project_code', new.project_code, 'team_name', new.team_name)
    );
    insert into notification_queue (type, channel, recipient_phone, team_id, payload)
    values (
      'phase3_shortlisted', 'whatsapp', new.leader_phone, new.id,
      jsonb_build_object('project_code', new.project_code, 'team_name', new.team_name)
    );

    insert into in_app_notifications (recipient_auth_id, type, title, body, link)
    values (
      new.leader_auth_id,
      'phase3_shortlisted',
      'Selected for Phase 3!',
      format('%s (%s) has been selected for Phase 3 — Development. Log in to see your mentor and ambassador.', new.team_name, new.project_code),
      '/portal/participant'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- Funding status change -> team leader
-- ----------------------------------------------------------------------------
create or replace function notify_funding_status_change()
returns trigger as $$
declare
  v_team record;
begin
  if new.funding_status is distinct from old.funding_status then
    select project_code, team_name, leader_email, leader_auth_id into v_team
    from teams where id = new.team_id;

    insert into notification_queue (type, channel, recipient_email, team_id, payload)
    values (
      'funding_status_update',
      'email',
      v_team.leader_email,
      new.team_id,
      jsonb_build_object(
        'project_code', v_team.project_code,
        'team_name', v_team.team_name,
        'status', new.funding_status,
        'amount_approved', new.amount_approved
      )
    );

    insert into in_app_notifications (recipient_auth_id, type, title, body, link)
    values (
      v_team.leader_auth_id,
      'funding_status_update',
      'Funding update',
      format(
        'Your funding request for %s is now: %s.%s',
        v_team.project_code,
        new.funding_status,
        case when new.amount_approved is not null then format(' Approved amount: ₹%s.', new.amount_approved) else '' end
      ),
      '/portal/participant'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- Mentor/ambassador assignment -> the staff member themself, and the team
-- leader (who their mentor/ambassador is). Builds on the already-fixed
-- version from 17_fix_assignment_notification_type_cast.sql — the enum
-- cast there is preserved unchanged, only the in_app_notifications inserts
-- are new.
-- ----------------------------------------------------------------------------
create or replace function after_assignment_created()
returns trigger as $$
declare
  v_team record;
  v_staff record;
  v_mentor_count int;
  v_ambassador_count int;
begin
  select project_code, team_name, leader_email, leader_phone, leader_auth_id into v_team
  from teams where id = new.team_id;

  select full_name, email, phone into v_staff
  from staff_profiles where id = new.staff_id;

  -- Notify the mentor/ambassador themself
  insert into notification_queue (type, channel, recipient_email, team_id, staff_id, payload)
  values (
    (case when new.assignment_role = 'mentor' then 'mentor_assigned' else 'ambassador_assigned' end)::notification_type,
    'email',
    v_staff.email,
    new.team_id,
    new.staff_id,
    jsonb_build_object(
      'staff_name', v_staff.full_name,
      'project_code', v_team.project_code,
      'team_name', v_team.team_name
    )
  );

  insert into in_app_notifications (recipient_auth_id, type, title, body, link)
  values (
    new.staff_id,
    case when new.assignment_role = 'mentor' then 'mentor_assigned' else 'ambassador_assigned' end,
    'New project assigned',
    format(
      'You''ve been assigned as %s for %s — "%s".',
      new.assignment_role, v_team.project_code, v_team.team_name
    ),
    case when new.assignment_role = 'mentor' then '/portal/mentor' else '/portal/ambassador' end
  );

  -- Notify the team leader who their mentor/ambassador is (via WhatsApp, per
  -- the current infra decision — swap channel here if that changes)
  insert into notification_queue (type, channel, recipient_phone, team_id, staff_id, payload)
  values (
    'team_notified_of_mentor',
    'whatsapp',
    v_team.leader_phone,
    new.team_id,
    new.staff_id,
    jsonb_build_object(
      'role', new.assignment_role,
      'staff_name', v_staff.full_name,
      'project_code', v_team.project_code
    )
  );

  insert into in_app_notifications (recipient_auth_id, type, title, body, link)
  values (
    v_team.leader_auth_id,
    'team_notified_of_mentor',
    format('%s assigned', initcap(new.assignment_role)),
    format('Your %s for %s is %s.', new.assignment_role, v_team.project_code, v_staff.full_name),
    '/portal/participant'
  );

  -- Auto-advance team status once BOTH roles are filled
  select count(*) into v_mentor_count
  from project_assignments where team_id = new.team_id and assignment_role = 'mentor';
  select count(*) into v_ambassador_count
  from project_assignments where team_id = new.team_id and assignment_role = 'ambassador';

  if v_mentor_count > 0 and v_ambassador_count > 0 then
    update teams set status = 'shortlisted_phase3' where id = new.team_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;
