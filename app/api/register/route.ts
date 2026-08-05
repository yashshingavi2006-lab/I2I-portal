import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchNotification } from "@/lib/notifications";

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
    "leader_password",
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
  if (String(body.leader_password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!body.consent_given) {
    return NextResponse.json({ error: "Consent is required" }, { status: 400 });
  }
  if (body.team_size < 1 || body.team_size > 3) {
    return NextResponse.json({ error: "Team size must be 1-3" }, { status: 400 });
  }
  // Every team member beyond the leader must have a name and email — this
  // is required at the form level too, but never trust the client alone.
  const expectedMembers = body.team_size - 1;
  const members = Array.isArray(body.members) ? body.members : [];
  for (let i = 0; i < expectedMembers; i++) {
    const m = members[i];
    if (!m?.full_name?.trim() || !m?.email?.trim()) {
      return NextResponse.json(
        { error: `Member ${i + 2}'s name and email are required` },
        { status: 400 }
      );
    }
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

  // Create the portal account FIRST, with the password they set during
  // registration itself — no email/link dependency to get into the portal
  // at all. If this fails (e.g. email already has an account), we bail
  // before creating anything else.
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: body.leader_email,
    password: body.leader_password,
    email_confirm: true,
    user_metadata: { full_name: body.leader_name },
  });

  if (authErr || !authData?.user) {
    if (authErr?.message?.toLowerCase().includes("already been registered")) {
      return NextResponse.json(
        { error: "An account already exists with this email. Try logging in, or use 'Forgot password' if needed." },
        { status: 409 }
      );
    }
    console.error("Could not create portal account:", authErr);
    return NextResponse.json({ error: "Could not create your portal account. Please try again." }, { status: 500 });
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
      leader_auth_id: authData.user.id,
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
    // The auth account was already created above — clean it up so this
    // email isn't left with a "ghost" account and no team if the team
    // insert failed for some other reason (e.g. the unique constraint,
    // though that should be rare since leader_password being required
    // means they got this far intentionally).
    await admin.auth.admin.deleteUser(authData.user.id);

    if (teamErr?.code === "23505") {
      return NextResponse.json(
        { error: "A team has already registered with this email address this year. Try logging in instead." },
        { status: 409 }
      );
    }
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

  // Confirmation email — sent immediately (not just queued), since the
  // queue only gets drained by a scheduled worker meant for a deployed
  // site (GitHub Actions hitting /api/notifications/process every 15 min).
  // In local dev, or before that's set up, nothing would ever send it.
  // We still record it in notification_queue either way, for an audit
  // trail and so a failed send can be retried by that same worker later.
  const notificationPayload = {
    project_code: team.project_code,
    team_name: body.team_name,
    login_email: body.leader_email,
    login_password: body.leader_password,
  };

  let emailSent = false;
  let emailError: string | null = null;
  try {
    await dispatchNotification({
      id: "sync-send", // not a real queue row id; this call bypasses the queue
      type: "registration_confirmed",
      channel: "email",
      recipient_email: body.leader_email,
      recipient_phone: null,
      payload: notificationPayload,
    });
    emailSent = true;
  } catch (e) {
    emailError = e instanceof Error ? e.message : "Unknown email error";
    console.error("Immediate confirmation email send failed:", emailError);
  }

  const { error: queueErr } = await admin.from("notification_queue").insert({
    type: "registration_confirmed",
    channel: "email",
    recipient_email: body.leader_email,
    team_id: team.id,
    payload: notificationPayload,
    status: emailSent ? "sent" : "pending",
    sent_at: emailSent ? new Date().toISOString() : null,
    error: emailError,
  });
  if (queueErr) console.error("Failed to record confirmation email in queue:", queueErr);

  return NextResponse.json({
    project_code: team.project_code,
    email_sent: emailSent,
  });
}
