import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal-header";
import { PageShell } from "@/components/page-shell";
import { PortfolioWorkspace } from "@/components/portfolio-workspace";

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

  return (
    <PageShell particles={false} theme="v0" className="flex min-h-screen flex-col">
      <PortalHeader
        portalLabel="Ambassador"
        name={staff.full_name}
        roleLabel={staff.head_title || staff.role.replace("_", " ")}
        currentUserId={user.id}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8">
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
