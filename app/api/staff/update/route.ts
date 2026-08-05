import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_ROLES = ["secretary", "chief_ambassador", "ambassador", "mentor", "head"];

export async function POST(req: NextRequest) {
  try {
    // Only a logged-in Secretary can edit/deactivate staff.
    const authed = await createClient();
    const {
      data: { user },
    } = await authed.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: actingStaff } = await authed
      .from("staff_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!actingStaff || actingStaff.role !== "secretary") {
      return NextResponse.json({ error: "Only the Secretary can manage staff" }, { status: 403 });
    }

    const body = await req.json();
    const { staff_id, full_name, role, head_title, is_active } = body;

    if (!staff_id) {
      return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (staff_id === user.id && is_active === false) {
      return NextResponse.json({ error: "You can't deactivate your own account" }, { status: 400 });
    }

    const admin = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (head_title !== undefined) updates.head_title = head_title || null;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length > 0) {
      const { error: profileErr } = await admin.from("staff_profiles").update(updates).eq("id", staff_id);
      if (profileErr) {
        return NextResponse.json({ error: profileErr.message }, { status: 500 });
      }
    }

    // is_active only gates staff_profiles rows read by the app — it doesn't
    // stop Supabase Auth login on its own. Ban/unban the auth user too so
    // deactivating someone actually locks them out.
    if (is_active !== undefined) {
      const { error: banErr } = await admin.auth.admin.updateUserById(staff_id, {
        ban_duration: is_active ? "none" : "876000h", // ~100 years = effectively permanent
      });
      if (banErr) {
        return NextResponse.json({ error: banErr.message }, { status: 500 });
      }
    }

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      actor_name: "Secretary",
      action: is_active !== undefined ? (is_active ? "staff_reactivated" : "staff_deactivated") : "staff_updated",
      target_type: "staff_profiles",
      target_id: staff_id,
      details: updates,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Staff update failed:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
