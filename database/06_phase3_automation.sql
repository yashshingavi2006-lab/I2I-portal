-- ============================================================================
-- PHASE 3 — MENTOR / AMBASSADOR ASSIGNMENT AUTOMATION
--
-- The Secretary manually decides WHO gets WHICH project (that's a judgment
-- call — sector fit, existing college relationships, mentor expertise — and
-- stays a human decision made through the dashboard UI). Everything AFTER
-- that decision is automatic:
--   1. Hard-enforced 1-3 project cap per mentor/ambassador (insert is
--      REJECTED, not just warned, if it would exceed 3)
--   2. Role sanity check (a 'mentor' assignment must go to a staff member
--      whose role is actually 'mentor'; 'ambassador' assignment_role must go
--      to 'ambassador' or 'chief_ambassador')
--   3. Portal access is live immediately — this is just RLS reading the
--      project_assignments table, already handled in 03_rls_policies.sql,
--      nothing further needed here
--   4. Notifications auto-enqueued: to the mentor/ambassador ("you've been
--      assigned project X") and to the team leader ("your mentor is Y")
--   5. Team status auto-advances to 'shortlisted_phase3' once BOTH a mentor
--      and an ambassador are attached
-- ============================================================================

create or replace function enforce_assignment_rules()
returns trigger as $$
declare
  v_current_count int;
  v_staff_role user_role;
begin
  -- Rule 1: hard cap of 3 active projects per staff member (regardless of role)
  select count(*) into v_current_count
  from project_assignments
  where staff_id = new.staff_id;

  if v_current_count >= 3 then
    raise exception
      'Assignment rejected: this staff member already has % projects (max 3).',
      v_current_count;
  end if;

  -- Rule 2: role sanity check
  select role into v_staff_role from staff_profiles where id = new.staff_id;

  if new.assignment_role = 'mentor' and v_staff_role != 'mentor' then
    raise exception
      'Assignment rejected: staff member''s role is %, not mentor.', v_staff_role;
  end if;

  if new.assignment_role = 'ambassador'
     and v_staff_role not in ('ambassador','chief_ambassador') then
    raise exception
      'Assignment rejected: staff member''s role is %, not ambassador/chief_ambassador.',
      v_staff_role;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_enforce_assignment_rules
  before insert on project_assignments
  for each row
  execute function enforce_assignment_rules();


-- ----------------------------------------------------------------------------
-- Auto-notify + auto-advance status after a successful assignment
-- ----------------------------------------------------------------------------
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
    case when new.assignment_role = 'mentor' then 'mentor_assigned' else 'ambassador_assigned' end,
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

create trigger trg_after_assignment_created
  after insert on project_assignments
  for each row
  execute function after_assignment_created();


-- ----------------------------------------------------------------------------
-- Convenience view for the Secretary's assignment screen: staff member,
-- their current load, and remaining capacity — powers the dropdown that
-- blocks selecting someone already at 3/3.
-- ----------------------------------------------------------------------------
create or replace view staff_assignment_capacity as
select
  sp.id as staff_id,
  sp.full_name,
  sp.role,
  count(pa.id) as current_projects,
  3 - count(pa.id) as remaining_capacity
from staff_profiles sp
left join project_assignments pa on pa.staff_id = sp.id
where sp.role in ('mentor','ambassador','chief_ambassador')
group by sp.id, sp.full_name, sp.role;
