import { createClient } from "@/lib/supabase/server";
import { Phase1Queue } from "@/components/secretary/phase1-queue";

export default async function Phase1Page() {
  const supabase = await createClient();

  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("id, project_code, project_name, college_name, leader_email, status, sectors(prefix)")
    .order("created_at", { ascending: false });

  const mapped = (teamsRaw ?? []).map((t) => ({
    id: t.id,
    project_code: t.project_code,
    project_name: t.project_name,
    college_name: t.college_name,
    leader_email: t.leader_email,
    status: t.status,
    sector_prefix: (t.sectors as unknown as { prefix: string } | null)?.prefix ?? "—",
  }));

  // Defensive de-dupe: a malformed join or a stale/duplicated row from the
  // client cache could otherwise hand Phase1Queue two rows with the same
  // (or missing) id, which is what triggers React's "duplicate key" warning.
  const seen = new Set<string>();
  const teams = mapped.filter((t) => {
    if (!t.id || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  return <Phase1Queue initialTeams={teams} />;
}
