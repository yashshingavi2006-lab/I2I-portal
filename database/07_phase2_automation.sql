-- ============================================================================
-- PHASE 2 — FUNDING APPLICATION AUTOMATION
-- ============================================================================

-- Convenience view: total requested amount per application, computed from
-- the itemized bills rather than trusting a manually-typed total (avoids the
-- classic spreadsheet problem of the sum not matching the line items).
create or replace view phase2_application_totals as
select
  pa.id as application_id,
  pa.team_id,
  coalesce(sum(bi.total_cost), 0) as calculated_total,
  count(bi.id) as bill_item_count
from phase2_applications pa
left join phase2_bill_items bi on bi.application_id = pa.id
group by pa.id, pa.team_id;

-- Auto-enqueue a notification whenever the Secretary changes funding_status
create or replace function notify_funding_status_change()
returns trigger as $$
declare
  v_team record;
begin
  if new.funding_status is distinct from old.funding_status then
    select project_code, team_name, leader_email into v_team
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
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_funding_status_change
  after update on phase2_applications
  for each row
  execute function notify_funding_status_change();


-- Auto-enqueue notification (+ team status advance) when the Secretary
-- shortlists a team into Phase 2. This is triggered by the same generic
-- teams.status update, watched specifically for the phase2 transition.
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
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_phase2_shortlist
  after update on teams
  for each row
  execute function notify_phase2_shortlist();
