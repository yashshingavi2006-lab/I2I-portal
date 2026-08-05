import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal-header";
import { PageShell } from "@/components/page-shell";
import { PortfolioWorkspace } from "@/components/portfolio-workspace";
import { Phase2ReviewerPanel } from "@/components/ambassador/phase2-reviewer-panel";

export default async function AmbassadorPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("full_name, role, head_title")
    .eq("id", user.id)
    .maybeSingle();

  // Guard: Chief Ambassadors, Ambassadors, and Heads belong here. Secretary
  // has their own portal; Mentors have their own separate portal.
  if (!staff || !["chief_ambassador", "ambassador", "head"].includes(staff.role)) {
    redirect("/dashboard");
  }

  // RLS already limits this to only the teams assigned to this staff member.
  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("id, project_code, team_name, college_name, status, leader_phone")
    .order("created_at", { ascending: false });

  // Phase 2 pitch deck + approved funding, joined manually since it's a
  // separate table (kept simple rather than a Postgres view for now).
  const teamIds = (teamsRaw ?? []).map((t) => t.id);
  const { data: phase2 } = teamIds.length
    ? await supabase
        .from("phase2_applications")
        .select("team_id, pitch_deck_url, amount_approved")
        .in("team_id", teamIds)
    : { data: [] };

  const teams = (teamsRaw ?? []).map((t) => {
    const p2 = phase2?.find((p) => p.team_id === t.id);
    return {
      ...t,
      pitch_deck_url: p2?.pitch_deck_url ?? null,
      amount_approved: p2?.amount_approved ?? null,
    };
  });

  // Phase 2 projects delegated to this staff member for review (Secretary's
  // "give access" flow) — RLS (is_phase2_reviewer) scopes this query to only
  // their delegated projects, same pattern the Secretary's own queue uses.
  const { data: reviewRowsRaw } = await supabase
    .from("phase2_applications")
    .select(
      "id, team_id, bills_doc_url, pitch_deck_url, mentor_requested, screening_status, funding_status, amount_approved, teams(project_code, project_name, college_name, sectors(prefix))"
    )
    .order("created_at", { ascending: false });

  const reviewRows = (reviewRowsRaw ?? []).map((r) => {
    const team = r.teams as unknown as {
      project_code: string | null;
      project_name: string;
      college_name: string;
      sectors: { prefix: string } | null;
    } | null;
    return {
      application_id: r.id,
      team_id: r.team_id,
      project_code: team?.project_code ?? null,
      project_name: team?.project_name ?? "—",
      sector_prefix: team?.sectors?.prefix ?? "—",
      college_name: team?.college_name ?? "—",
      bills_doc_url: r.bills_doc_url,
      pitch_deck_url: r.pitch_deck_url,
      mentor_requested: r.mentor_requested,
      screening_status: r.screening_status,
      funding_status: r.funding_status,
      amount_approved: r.amount_approved,
    };
  });

  return (
    <PageShell particles={false} theme="v0" className="flex min-h-screen flex-col">
      <PortalHeader
        portalLabel="Ambassador"
        name={staff.full_name}
        roleLabel={staff.head_title || staff.role.replace("_", " ")}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-10 sm:px-8">
        <Phase2ReviewerPanel initialRows={reviewRows} />
        <PortfolioWorkspace
          teams={teams}
          role="ambassador"
          currentUserId={user.id}
          currentUserName={staff.full_name}
        />
      </main>
    </PageShell>
  );
}
