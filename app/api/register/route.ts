import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    return await handleRegistration(req);
  } catch (e) {
    // Catches anything unexpected (missing/invalid env vars, Supabase being
    // unreachable, etc.) so the client always gets valid JSON back instead
    // of a crashed, empty response that breaks res.json() with a cryptic
    // "Unexpected end of JSON input" error.
    console.error("Registration failed unexpectedly:", e);
    const message =
      e instanceof Error && e.message.includes("supabaseUrl")
        ? "Server is not configured yet (missing Supabase credentials). Contact the site admin."
        : "Something went wrong while saving your registration. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleRegistration(req: NextRequest) {
  const body = await req.json();
  const admin = createAdminClient();

  // --- basic server-side validation (never trust the client) ---
  const required = [
    "team_name",
    "leader_name",
    "leader_email",
    "leader_phone",
    "state",
    "city",
    "college_name",
    "sector_prefix",
    "project_name",
    "problem_statement",
    "proposed_solution",
    "target_beneficiaries",
  ];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim() === "") {
      return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
    }
  }
  if (!body.consent_given) {
    return NextResponse.json({ error: "Consent is required" }, { status: 400 });
  }
  if (body.team_size < 1 || body.team_size > 3) {
    return NextResponse.json({ error: "Team size must be 1-3" }, { status: 400 });
  }

  // Look up sector id from prefix
  const { data: sector, error: sectorErr } = await admin
    .from("sectors")
    .select("id")
    .eq("prefix", body.sector_prefix)
    .single();

  if (sectorErr || !sector) {
    return NextResponse.json({ error: "Invalid sector" }, { status: 400 });
  }

  // Insert the team — project_code is generated automatically by the
  // database trigger (see database/02_functions.sql)
  const { data: team, error: teamErr } = await admin
    .from("teams")
    .insert({
      team_name: body.team_name,
      team_size: body.team_size,
      sector_id: sector.id,
      leader_name: body.leader_name,
      leader_email: body.leader_email,
      leader_phone: body.leader_phone,
      leader_whatsapp_optin: body.leader_whatsapp_optin,
      leader_gender: body.leader_gender || null,
      leader_dob: body.leader_dob || null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      heard_about_us: body.heard_about_us || null,
      state: body.state,
      city: body.city,
      college_name: body.college_name,
      college_type: body.college_type || null,
      faculty_contact_name: body.faculty_contact_name || null,
      faculty_contact_phone: body.faculty_contact_phone || null,
      sub_theme: body.sub_theme || null,
      project_name: body.project_name,
      problem_statement: body.problem_statement,
      proposed_solution: body.proposed_solution,
      target_beneficiaries: body.target_beneficiaries,
      innovation_notes: body.innovation_notes || null,
      idea_stage: body.idea_stage || null,
      consent_given: true,
    })
    .select("id, project_code")
    .single();

  if (teamErr || !team) {
    console.error(teamErr);
    return NextResponse.json({ error: "Could not save registration" }, { status: 500 });
  }

  // Insert other team members (if any)
  if (Array.isArray(body.members) && body.members.length > 0) {
    const rows = body.members
      .filter((m: { full_name: string }) => m.full_name?.trim())
      .map((m: { full_name: string; email: string; phone: string; year_of_study: string }) => ({
        team_id: team.id,
        full_name: m.full_name,
        email: m.email || null,
        phone: m.phone || null,
        year_of_study: m.year_of_study || null,
      }));
    if (rows.length > 0) {
      const { error: membersErr } = await admin.from("team_members").insert(rows);
      if (membersErr) console.error("team_members insert failed:", membersErr);
    }
  }

  // Invite the team leader — this sends an email with a link that lets them
  // set their password (satisfies "verification mail to set a new password").
  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    body.leader_email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
      data: { full_name: body.leader_name, team_id: team.id },
    }
  );

  if (inviteErr) {
    // Registration itself succeeded — don't fail the whole request, but log
    // it so staff can manually resend the invite if needed.
    console.error("Invite email failed:", inviteErr);
  } else {
    // Link the auth user back to the team once created.
    const { data: userList } = await admin.auth.admin.listUsers();
    const authUser = userList.users.find((u) => u.email === body.leader_email);
    if (authUser) {
      await admin.from("teams").update({ leader_auth_id: authUser.id }).eq("id", team.id);
    }
  }

  return NextResponse.json({ project_code: team.project_code });
}
