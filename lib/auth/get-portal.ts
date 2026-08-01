import { createClient } from "@/lib/supabase/server";

export type PortalDestination =
  | "/portal/secretary"
  | "/portal/ambassador"
  | "/portal/mentor"
  | "/portal/participant"
  | null;

// Single source of truth for "which portal does this logged-in user belong
// to". Used by /dashboard (redirect-on-login) and by each portal page
// (kicks a user out if they land on the wrong one directly via URL).
export async function resolvePortalForCurrentUser(): Promise<PortalDestination> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Staff account? (Secretary, Chief Ambassador, Ambassador, Mentor, Head)
  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (staff) {
    if (staff.role === "secretary") return "/portal/secretary";
    if (staff.role === "mentor") return "/portal/mentor";
    // Chief ambassadors, ambassadors, and heads land in the ambassador portal.
    return "/portal/ambassador";
  }

  // Otherwise: is this user a team leader (participant)?
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_auth_id", user.id)
    .maybeSingle();

  if (team) return "/portal/participant";

  return null; // logged in, but no recognized role — shouldn't normally happen
}
