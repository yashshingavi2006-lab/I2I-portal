import { createClient } from "@/lib/supabase/server";
import { EditRequestsTable } from "@/components/secretary/edit-requests-table";

export default async function EditRequestsPage() {
  const supabase = await createClient();

  const { data: requestsRaw } = await supabase
    .from("edit_requests")
    .select("id, section, reason, status, created_at, teams(project_code, team_name)")
    .order("created_at", { ascending: false });

  const rows = (requestsRaw ?? []).map((r) => {
    const team = r.teams as unknown as { project_code: string | null; team_name: string } | null;
    return {
      id: r.id,
      section: r.section,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
      project_code: team?.project_code ?? null,
      team_name: team?.team_name ?? "—",
    };
  });

  return <EditRequestsTable initialRows={rows} />;
}
