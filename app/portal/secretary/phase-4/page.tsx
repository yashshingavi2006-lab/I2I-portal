import { createClient } from "@/lib/supabase/server";
import { Phase4Table } from "@/components/secretary/phase4-table";

export default async function Phase4Page() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, project_code, project_name, college_name")
    .in("status", ["shortlisted_phase3", "funded", "completed"])
    .order("created_at", { ascending: false });

  const teamIds = (teams ?? []).map((t) => t.id);
  const { data: submissions } = teamIds.length
    ? await supabase
        .from("phase4_submissions")
        .select("id, team_id, report_doc_url, final_ppt_url, demo_video_url, jury_score, result_award")
        .in("team_id", teamIds)
    : { data: [] };

  const rows = (teams ?? []).map((t) => {
    const sub = submissions?.find((s) => s.team_id === t.id);
    return {
      id: sub?.id ?? null,
      team_id: t.id,
      project_code: t.project_code,
      project_title: t.project_name,
      college_name: t.college_name,
      report_doc_url: sub?.report_doc_url ?? null,
      final_ppt_url: sub?.final_ppt_url ?? null,
      demo_video_url: sub?.demo_video_url ?? null,
      jury_score: sub?.jury_score ?? null,
      result_award: sub?.result_award ?? "not_scored",
    };
  });

  return <Phase4Table initialRows={rows} />;
}
