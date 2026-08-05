import { createClient } from "@/lib/supabase/server";

export default async function SecretaryOverview() {
  const supabase = await createClient();

  const [{ count: total }, { count: pending }, { count: eligible }, { data: sectors }, { data: teams }, { data: audit }] =
    await Promise.all([
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("teams").select("*", { count: "exact", head: true }).eq("status", "registered"),
      supabase
        .from("teams")
        .select("*", { count: "exact", head: true })
        .in("status", ["shortlisted_phase2", "shortlisted_phase3", "funded", "completed"]),
      supabase.from("sectors").select("id, prefix, display_name"),
      supabase.from("teams").select("sector_id, status"),
      supabase
        .from("audit_logs")
        .select("actor_name, action, details, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const selectionRate = total && total > 0 ? Math.round(((eligible ?? 0) / total) * 100) : 0;

  const bySectorId = new Map<string, number>();
  (teams ?? []).forEach((t) => {
    bySectorId.set(t.sector_id, (bySectorId.get(t.sector_id) ?? 0) + 1);
  });
  const maxSectorCount = Math.max(1, ...Array.from(bySectorId.values()));

  const statusGroups = [
    { label: "Registration & Submission", statuses: ["registered", "under_review"] },
    { label: "Technical Proposal & Feasibility", statuses: ["shortlisted_phase2"] },
    { label: "Mentorship & Business Model", statuses: ["shortlisted_phase3"] },
    { label: "Prototype & MVP Development", statuses: ["funded", "completed"] },
  ].map((g) => ({
    ...g,
    count: (teams ?? []).filter((t) => g.statuses.includes(t.status)).length,
  }));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-marigold">
        Overview
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink">Performance Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Competition key metrics and student innovation distributions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Innovations" value={total ?? 0} />
        <StatCard label="Pending Reviews" value={pending ?? 0} accent />
        <StatCard label="Eligible Innovations" value={eligible ?? 0} green />
        <StatCard label="Selection Rate" value={`${selectionRate}%`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-sm font-semibold text-ink">Innovations by Sector</h3>
          <div className="mt-5 flex h-40 items-end gap-3">
            {(sectors ?? []).map((s) => {
              const count = bySectorId.get(s.id) ?? 0;
              return (
                <div key={s.prefix} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t bg-marigold/70"
                      style={{ height: `${(count / maxSectorCount) * 100}%`, minHeight: count ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{s.prefix}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-sm font-semibold text-ink">
            Innovations by Competition Gate
          </h3>
          <div className="mt-5 space-y-3">
            {statusGroups.map((g) => (
              <div key={g.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-light">{g.label}</span>
                  <span className="text-muted">{g.count}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-paper">
                  <div
                    className="h-1.5 rounded-full bg-marigold"
                    style={{
                      width: `${total ? Math.min(100, (g.count / total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-sm font-semibold text-ink">Recent Audit Activity</h3>
        <div className="mt-4 space-y-3">
          {(audit ?? []).length === 0 ? (
            <p className="text-sm text-muted">No activity logged yet.</p>
          ) : (
            audit!.map((a, i) => (
              <div key={i} className="flex items-center justify-between border-b border-line pb-2.5 last:border-0">
                <div>
                  <p className="text-sm font-medium capitalize text-ink">
                    {a.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted">{a.actor_name}</p>
                </div>
                <span className="text-xs text-muted">
                  {new Date(a.created_at).toLocaleString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  green,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-bold ${
          accent ? "text-marigold" : green ? "text-green-400" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
