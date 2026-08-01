import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-SIDE ONLY. Never import this into a Client Component — it uses the
// service role key, which bypasses RLS entirely. Used for:
//  - inviting the team leader by email after registration (sets their password)
//  - admin actions like assigning mentors/ambassadors, changing team status
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
