-- ============================================================================
-- FIX: "Assign Mentor & Ambassador" was completely broken.
--
-- after_assignment_created() (06_phase3_automation.sql) inserts a
-- notification_queue row whose `type` comes from a CASE expression:
--   case when new.assignment_role = 'mentor' then 'mentor_assigned'
--        else 'ambassador_assigned' end
-- Postgres infers this CASE expression's type as `text`, not the untyped
-- string literal it would be outside a CASE — and text does not implicitly
-- cast to the notification_type enum. Every insert into project_assignments
-- (i.e. every attempt to assign a mentor/ambassador from the Secretary's
-- Phase 3 screen) therefore failed with:
--   "column "type" is of type notification_type but expression is of type text"
-- and rolled back the whole assignment, since the trigger runs in the same
-- transaction as the triggering insert.
--
-- Fix: cast the CASE expression to notification_type explicitly.
-- ============================================================================

create or replace function after_assignment_created()
returns trigger as $$
declare
  v_team record;
  v_staff record;
  v_mentor_count int;
  v_ambassador_count int;
begin
  select project_code, team_name, leader_email, leader_phone into v_team
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
$$ language plpgsql;
