import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_ROLES = ["secretary", "chief_ambassador", "ambassador", "mentor", "head"];

export async function POST(req: NextRequest) {
  try {
    // Only a logged-in Secretary can invite staff.
    const authed = await createClient();
    const {
      data: { user },
    } = await authed.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: staff } = await authed
      .from("staff_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!staff || staff.role !== "secretary") {
      return NextResponse.json({ error: "Only the Secretary can invite staff" }, { status: 403 });
    }

    const body = await req.json();
    const { full_name, email, role, head_title } = body;

    if (!full_name || !email || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
      data: { full_name },
    });

    if (inviteErr || !invited.user) {
      return NextResponse.json(
        { error: inviteErr?.message || "Could not invite user" },
        { status: 500 }
      );
    }

    const { error: profileErr } = await admin.from("staff_profiles").insert({
      id: invited.user.id,
      full_name,
      email,
      role,
      head_title: head_title || null,
    });

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      actor_name: "Secretary",
      action: "staff_invited",
      target_type: "staff_profiles",
      target_id: invited.user.id,
      details: { role, email },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Staff invite failed:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
