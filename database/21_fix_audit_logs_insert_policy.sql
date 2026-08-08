-- ============================================================================
-- FIX: every staff-facing panel that writes to audit_logs from the browser
-- (TimelineLockPanel, AssignmentPanel, Phase2ReviewModal, PhaseEnginePanel,
-- TeamDetailPanel, Phase2Queue, Phase2DelegatePanel, and the ambassador's
-- delegated Phase2ReviewerPanel) has been silently failing with a 403. The
-- original policy in 09_extended_rls.sql only covered SELECT — there was no
-- INSERT policy, so RLS denied every insert by default. The underlying
-- action itself still worked (each panel updates its own table, which has
-- its own policy), but the audit trail entry for that action was never
-- written. Scoped to any signed-in staff member (not just Secretary),
-- since the ambassador reviewer panel logs too.
-- ============================================================================

create policy audit_logs_staff_insert on audit_logs
  for insert with check (
    exists (select 1 from staff_profiles where id = auth.uid())
  );
