import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal-header";
import { PageShell } from "@/components/page-shell";
import { AnimatedCard } from "@/components/animated-card";

export default async function ParticipantPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: team } = await supabase
    .from("teams")
    .select("team_name, project_code, status, leader_name, sector_id")
    .eq("leader_auth_id", user.id)
    .maybeSingle();

  // Guard: only the registered team leader (participant) belongs here.
  if (!team) redirect("/dashboard");

  return (
    <PageShell particles={false} className="flex min-h-screen flex-col">
      <PortalHeader
        portalLabel="Participant"
        name={team.leader_name}
        roleLabel="Team Leader"
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
        <AnimatedCard>
          <p className="text-xs font-semibold uppercase tracking-widest text-marigold">
            {team.project_code}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            {team.team_name}
          </h1>
          <span className="mt-3 inline-block rounded-full border border-line bg-paper px-3 py-1 text-xs capitalize text-ink-light">
            {team.status.replace(/_/g, " ")}
          </span>
        </AnimatedCard>

        <AnimatedCard delay={0.15} className="mt-8 border-dashed text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Participant portal — full layout pending
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            This is where your team can track phase progress, submit Phase 2
            details when shortlisted, see your assigned mentor and ambassador,
            and view your project code — exact layout pending your spec.
          </p>
        </AnimatedCard>
      </main>
    </PageShell>
  );
}
