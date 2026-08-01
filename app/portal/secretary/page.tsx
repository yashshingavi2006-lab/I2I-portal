import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal-header";
import { PageShell } from "@/components/page-shell";
import { AnimatedStatCard } from "@/components/animated-stat-card";

export default async function SecretaryPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // Guard: only the Secretary belongs here — anyone else gets bounced back
  // to the router, which sends them to their correct portal instead.
  if (!staff || staff.role !== "secretary") redirect("/dashboard");

  // Quick counts for now — full breakdown of what belongs on this screen
  // (registrations table, assignment tools, funding approvals, exports,
  // access management for chief ambassadors/ambassadors/mentors) is pending
  // your spec.
  const { count: totalTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  const { count: pendingFunding } = await supabase
    .from("phase2_applications")
    .select("*", { count: "exact", head: true })
    .eq("funding_status", "under_review");

  return (
    <PageShell particles={false} className="flex min-h-screen flex-col">
      <PortalHeader portalLabel="Secretary" name={staff.full_name} roleLabel="Master access" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <AnimatedStatCard label="Total registrations" value={totalTeams ?? 0} delay={0} />
          <AnimatedStatCard label="Funding under review" value={pendingFunding ?? 0} delay={0.1} />
          <AnimatedStatCard label="Sectors" value={6} delay={0.2} />
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Secretary portal — full layout pending
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            This is where full registration management, mentor/ambassador
            assignment, funding approvals, access control, and data export
            will live once you share the exact spec for this portal.
          </p>
        </div>
      </main>
    </PageShell>
  );
}
