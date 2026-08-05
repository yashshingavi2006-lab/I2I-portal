import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  // A trivial query — enough to count as DB activity for Supabase's
  // "paused after 7 days of no activity" rule.
  const { error } = await admin.from("sectors").select("id").limit(1);
  if (error) {
    return NextResponse.json({ status: "db_error", error: error.message }, { status: 500 });
  }
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
