import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolvePortalForCurrentUser } from "@/lib/auth/get-portal";

// /dashboard is just a router: after login, send the user straight to
// whichever of the 3 portals matches their role. No UI lives here.
export default async function DashboardRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const destination = await resolvePortalForCurrentUser();

  if (!destination) {
    redirect("/login?error=no_role_assigned");
  }

  redirect(destination);
}
