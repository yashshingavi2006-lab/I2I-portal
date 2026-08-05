import { createClient } from "@/lib/supabase/server";
import { Phase2Queue } from "@/components/secretary/phase2-queue";

export default async function Phase2Page() {
  const supabase = await createClient();

  const { data: rowsRaw } = await supabase
    .from("phase2_applications")
    .select(
      "id, team_id, bills_doc_url, pitch_deck_url, mentor_requested, submitted_at, screening_status, funding_status, amount_approved, teams(project_code, project_name, college_name, sectors(prefix))"
    )
    .order("created_at", { ascending: false });

  const rows = (rowsRaw ?? []).map((r) => {
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
      leader_email: "",
      bills_doc_url: r.bills_doc_url,
      pitch_deck_url: r.pitch_deck_url,
      mentor_requested: r.mentor_requested,
      submitted_at: r.submitted_at,
      screening_status: r.screening_status,
      funding_status: r.funding_status,
      amount_approved: r.amount_approved,
    };
  });

  return <Phase2Queue initialRows={rows} />;
}
