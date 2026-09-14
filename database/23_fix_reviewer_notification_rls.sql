-- ============================================================================
-- BONUS FIX — found while testing 22_lock_down_write_escalation.sql, not one
-- of the original 4 security findings, but a real, already-live bug:
--
-- notify_funding_status_change() (07_phase2_automation.sql) and
-- notify_phase3_shortlist() (16_phase3_review_and_notify.sql) are plain
-- (non-security-definer) trigger functions that insert into
-- notification_queue, which only Secretary/admin may write to
-- (notification_queue_secretary policy, 05_notifications.sql). Since these
-- triggers run with the CALLING user's own privileges, any delegated Phase
-- 2 reviewer (19_phase2_reviewer_delegation.sql — an ambassador/chief
-- ambassador handed specific projects to review) who actually exercises
-- their funding-decision or status-advancing power hits an RLS violation
-- on notification_queue — which rolls back their entire funding decision,
-- not just the notification. The delegation feature has been broken for
-- any reviewer who isn't also a Secretary since it shipped; this was never
-- caught because nothing in this repo's test suite exercised that path
-- end-to-end until now.
--
-- notify_phase2_shortlist() has the same shape and is fixed alongside for
-- consistency, even though today's app doesn't appear to reach it from a
-- non-secretary session.
--
-- Fix: mark them security definer, the same pattern already used for
-- is_secretary() / is_phase2_reviewer() for exactly this "needs to act
-- with elevated privilege regardless of caller" situation.
-- ============================================================================

alter function notify_funding_status_change() security definer;
alter function notify_phase2_shortlist() security definer;
alter function notify_phase3_shortlist() security definer;
