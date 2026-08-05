-- ============================================================================
-- Run after 15_bank_pan_manual_fields.sql.
--
-- 1. A `submitted_at` timestamp on phase2_applications so the participant
--    has an explicit "Review & Submit" step, and the Secretary's export
--    can filter to teams that actually finished (vs. mid-fill).
-- 2. A `phase3_shortlisted` notification, auto-enqueued the same way
--    `phase2_shortlisted` already is — via a trigger on teams.status, so
--    it fires no matter which code path moves a team into Phase 3 (the
--    existing single-project modal, or the new spreadsheet bulk import).
-- ============================================================================

alter table phase2_applications
  add column if not exists submitted_at timestamptz;

comment on column phase2_applications.submitted_at is
  'Set when the participant clicks "Submit for Review" on the Review tab. Re-submitting after edits just re-stamps this — it is not a hard lock.';

alter type notification_type add value if not exists 'phase3_shortlisted';

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
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_phase3_shortlist
  after update on teams
  for each row
  execute function notify_phase3_shortlist();
