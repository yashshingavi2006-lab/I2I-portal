import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCertificatePdf } from "@/lib/certificate";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, leader_name, project_name, project_code, status")
    .eq("leader_auth_id", user.id)
    .maybeSingle();

  if (!team) {
    return NextResponse.json({ error: "No team found for this account" }, { status: 404 });
  }
  if (team.status !== "rejected") {
    return NextResponse.json(
      { error: "Certificates are only available for teams not selected to continue." },
      { status: 403 }
    );
  }

  const who = request.nextUrl.searchParams.get("who");
  if (!who) {
    return NextResponse.json({ error: "Missing 'who' parameter" }, { status: 400 });
  }

  let recipientName: string;
  if (who === "leader") {
    recipientName = team.leader_name;
  } else {
    const { data: member } = await supabase
      .from("team_members")
      .select("full_name")
      .eq("id", who)
      .eq("team_id", team.id)
      .maybeSingle();
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    recipientName = member.full_name;
  }

  // Phase reached: the schema only records a single generic 'rejected'
  // status (no per-phase rejection value), so we infer how far the team
  // got from whether a Phase 2 application row exists at all.
  const { data: phase2 } = await supabase
    .from("phase2_applications")
    .select("id")
    .eq("team_id", team.id)
    .maybeSingle();
  const phaseLabel = phase2 ? "Phase 2" : "Phase 1";

  const issuedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfBytes = await generateCertificatePdf({
    recipientName,
    projectName: team.project_name,
    projectCode: team.project_code,
    phaseLabel,
    issuedOn,
  });

  const filename = `I2I-Certificate-${recipientName.replace(/[^a-z0-9]+/gi, "-")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
