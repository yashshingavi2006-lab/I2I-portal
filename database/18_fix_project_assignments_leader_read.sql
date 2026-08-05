-- ============================================================================
-- FIX: participants could never see their assigned mentor/ambassador.
--
-- The Phase 3 participant panel (components/participant/workspace-tab.tsx,
-- Phase3Panel) queries project_assignments directly from the browser to
-- show "Assigned Mentor" / "Assigned Ambassador". But 03_rls_policies.sql
-- only grants SELECT on project_assignments to the assigned staff member
-- themself (`assignments_own`, staff_id = auth.uid()) or the secretary
-- (`assignments_secretary_manage`) — there was never a policy letting a
-- team's own leader read their team's assignment rows. The query returns
-- an empty array (not an error, since RLS just filters rows), so every
-- participant sees "Not yet assigned" even after a real assignment exists.
--
-- Found via end-to-end testing: after assigning a mentor + ambassador to a
-- test team, the team leader's portal still showed "Not yet assigned" for
-- both, while a service-role query confirmed the rows existed.
-- ============================================================================

create policy assignments_team_leader_read on project_assignments
  for select using (
    exists (
      select 1 from teams
      where id = project_assignments.team_id and leader_auth_id = auth.uid()
    )
  );
